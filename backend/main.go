package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/aabiji/lobbuddy/database"
)

func getDatabase() (*pgxpool.Pool, *database.Queries, error) {
	ctx := context.Background()

	url := fmt.Sprintf(
		"postgresql://%s:%s@%s:%s/%s",
		url.QueryEscape(os.Getenv("POSTGRES_USER")),
		url.QueryEscape(os.Getenv("POSTGRES_PASSWORD")),
		url.QueryEscape(os.Getenv("POSTGRES_HOSTNAME")),
		url.QueryEscape(os.Getenv("DB_PORT")),
		url.QueryEscape(os.Getenv("POSTGRES_DB")))

	conn, err := pgxpool.New(ctx, url)
	if err != nil {
		return nil, nil, err
	}

	queries := database.New(conn)
	return conn, queries, nil
}

func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func respond(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	payload := map[string]any{}
	if err, ok := data.(error); ok {
		payload["error"] = err.Error()
	} else {
		payload["data"] = data
	}
	json.NewEncoder(w).Encode(payload)
}

func parseRequest[T any](w http.ResponseWriter, r *http.Request) *T {
	var value T
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&value); err != nil {
		respond(w, http.StatusInternalServerError, errors.New("failed to parse request json"))
		return nil
	}
	return &value
}

func extractUserID(w http.ResponseWriter, r *http.Request) {
	authHeader := strings.TrimSpace(r.Header.Get("Authorization"))
	if len(authHeader) == 0 {
		respond(w, http.StatusUnauthorized, errors.New("missing Authorization header"))
		return
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		respond(w, http.StatusUnauthorized, errors.New("invalid Authorization header"))
		return
	}

	str := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))
	token, err := verifyToken(str, os.Getenv("JWT_SECRET"))
	if err != nil {
		respond(w, http.StatusInternalServerError, errors.New("failed to verify jwt"))
		return
	}

	// TODO: 1. use ParseWithClaims
	// 		 2. Check if the token has expired
	//       3. In order to reduce db traffic, we won't check for the userid every single api request.
	//          Instead, we'll issue jwts that have a 15 minute expiry, then on the frontend side,
	//			whenver we make *any* request, we optionally retry that request if our token has expired,
	// 			after calling an endpoint to issue a new jwt for us. Only then when we issue the new jwt
	// 			do we check that the userid they're positing is correct.
	// 			Doing this it'll be paramount that it is indeed us that issued the token, and not some
	// 			external attacker
}

type TestEndpoint struct {
	Name string `json:"name"`
}

func testEndpoint(w http.ResponseWriter, r *http.Request) {
	req := parseRequest[TestEndpoint](w, r)
	if req == nil {
		return
	}

	respond(w, http.StatusOK, H{"msg": fmt.Sprintf("hello %s!", req.Name)})
}

func main() {
	conn, _, err := getDatabase()
	if err != nil {
		log.Println(err.Error())
		return
	}
	defer conn.Close()

	mux := http.NewServeMux()
	mux.HandleFunc("/test", testEndpoint)

	handler := CORSMiddleware(mux)
	log.Println("Server starting at localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))

	log.Println("hello world :)")
}
