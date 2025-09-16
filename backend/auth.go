package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/argon2"
)

func createToken(userId string, secret string) (string, error) {
	expiry := time.Now().AddDate(0, 0, 100) // 100 days out
	claims := jwt.MapClaims{"sub": userId, "exp": expiry.Unix()}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func verifyToken(tokenStr string, secret string) (*jwt.Token, error) {
	return jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(secret), nil
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
func verifyPassword(password string, hashStr string) (bool, error) {
	parts := strings.Split(hashStr, "$")[1:]
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
