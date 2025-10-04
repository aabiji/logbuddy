package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"golang.org/x/crypto/argon2"
)

func createToken(userId int32) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().AddDate(0, 3, 0)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Subject:   fmt.Sprintf("%d", userId),
		Issuer:    "logbuddy-token",
	})

	secret := []byte(os.Getenv("JWT_SECRET"))
	return token.SignedString(secret)
}

func verifyToken(tokenStr string) (*jwt.Token, error) {
	return jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}

		issuer, err := t.Claims.GetIssuer()
		if err != nil {
			return nil, err
		}
		if issuer != "logbuddy-token" {
			return nil, fmt.Errorf("unknown issuer")
		}

		return []byte(os.Getenv("JWT_SECRET")), nil
	})
}

// hash a password and return the hash in the password hashing competition format
func hashPassword(password string) (string, error) {
	salt := make([]byte, 32)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	encodedSalt := base64.RawStdEncoding.EncodeToString(salt)

	var threads uint8 = 4
	var time, memory, size uint32 = 2, 64 * 1024, 64
	key := argon2.IDKey([]byte(password), salt, time, memory, threads, size)
	hash := base64.RawStdEncoding.EncodeToString(key)

	return fmt.Sprintf(
		"$argon2id$v=19$m=%d,t=%d,p=%d$%s$%s",
		memory, time, threads, encodedSalt, hash), nil
}

// check if the hash of the password is the same as an existing password hash
func verifyPassword(password string, actualPassword string) (bool, error) {
	parts := strings.Split(actualPassword, "$")[1:]
	if parts[0] != "argon2id" && parts[1] != "19" {
		return false, fmt.Errorf("unsupported algorithm")
	}

	var threads uint8
	var memory, time uint32

	for _, p := range strings.Split(parts[2], ",") {
		kv := strings.Split(p, "=")
		val, err := strconv.ParseUint(kv[1], 10, 32)
		if err != nil {
			return false, err
		}
		switch kv[0] {
		case "m":
			memory = uint32(val)
		case "t":
			time = uint32(val)
		case "p":
			threads = uint8(val)
		}
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[3])
	if err != nil {
		return false, err
	}

	key := argon2.IDKey([]byte(password), salt, time, memory, threads, 64)
	hash := base64.RawStdEncoding.EncodeToString(key)

	return hash == parts[4], nil
}

// Get the user ID from the json web token in the request Authorization
// header and check that the user's present in the database
func parseJWT(a *API, w http.ResponseWriter, r *http.Request) (int32, bool) {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	if !strings.HasPrefix(authHeader, "Bearer ") {
		respond(w, http.StatusUnauthorized, "Invalid Authorization header")
		return -1, false
	}

	str := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := verifyToken(str)
	if err != nil {
		if err == jwt.ErrTokenExpired {
			respond(w, http.StatusUnauthorized, "token expired")
			return -1, false
		}

		respond(w, http.StatusUnauthorized, "invalid token")
		return -1, false
	}

	subject, err := token.Claims.GetSubject()
	if err != nil {
		respond(w, http.StatusUnauthorized, "invalid token")
		return -1, false
	}

	id, err := strconv.ParseInt(subject, 10, 32)
	if err != nil {
		respond(w, http.StatusUnauthorized, "invalid token")
		return -1, false
	}

	exists, err := a.queries.ValidateUser(a.ctx, int32(id))
	if !exists || err != nil {
		respond(w, http.StatusUnauthorized, "user not found")
		return -1, false
	}

	return int32(id), true
}

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Validate the email and password combo. If they correspond
// to an account, return a "refresh" token, which is needed for
// refreshing the main token, which is used to authenticate requests.
func (a *API) Login(w http.ResponseWriter, r *http.Request) {
	req, ok := parseRequest[AuthRequest](w, r)
	if !ok {
		return
	}

	user, err := a.queries.GetUserByEmail(a.ctx, req.Email)
	if err == pgx.ErrNoRows {
		respond(w, http.StatusUnauthorized, "account not found")
		return
	}

	correct, err := verifyPassword(req.Password, user.Password)
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to validate password")
		return
	}

	if !correct {
		respond(w, http.StatusUnauthorized, "wrong password")
		return
	}

	token, err := createToken(user.ID)
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create token")
		return
	}

	respond(w, http.StatusOK, map[string]string{"token": token})
}

// Create a new account if there isn't an existing account
// using the same email. Then, return a "refresh" token, which
// is needed for refreshing the main token, which is used to
// authenticate requests.
func (a *API) CreateAccount(w http.ResponseWriter, r *http.Request) {
	req, ok := parseRequest[AuthRequest](w, r)
	if !ok {
		return
	}

	if _, err := a.queries.GetUserByEmail(a.ctx, req.Email); err != pgx.ErrNoRows {
		respond(w, http.StatusUnauthorized, "account already exists")
		return
	}

	hashed, err := hashPassword(req.Password)
	if err != nil {
		respond(w, http.StatusInternalServerError, "failed to hash password")
		return
	}

	id, err := newUser(a, req.Email, hashed)
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create user")
		return
	}

	token, err := createToken(id)
	if err != nil {
		respond(w, http.StatusInternalServerError, "couldn't create token")
		return
	}

	respond(w, http.StatusOK, map[string]string{"token": token})
}
