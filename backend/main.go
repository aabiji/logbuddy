package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/aabiji/lobbuddy/database"
)

type LoggingResponseWriter struct {
	w          http.ResponseWriter
	statusCode int
}

func (l *LoggingResponseWriter) Header() http.Header            { return l.w.Header() }
func (l *LoggingResponseWriter) Write(data []byte) (int, error) { return l.w.Write(data) }
func (l *LoggingResponseWriter) WriteHeader(statusCode int) {
	l.statusCode = statusCode
	l.w.WriteHeader(statusCode)
}

type API struct {
	ctx     context.Context
	conn    *pgxpool.Pool
	queries *database.Queries
}

func NewAPI() (API, error) {
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
		return API{}, err
	}

	schema, err := os.ReadFile("sql/schema.sql")
	if err != nil {
		return API{}, err
	}

	if _, err := conn.Exec(ctx, string(schema)); err != nil {
		return API{}, err
	}

	queries := database.New(conn)
	return API{ctx, conn, queries}, nil
}

func (a *API) Cleanup() {
	a.conn.Close()
}

func respond(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	var payload any
	if message, ok := data.(string); ok {
		payload = map[string]string{"error": message}
	} else {
		payload = data
	}
	json.NewEncoder(w).Encode(payload)
}

func parseRequest[T any](w http.ResponseWriter, r *http.Request) (T, bool) {
	var value T
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&value); err != nil {
		respond(w, http.StatusInternalServerError, "Failed to parse request json")
		return value, false
	}
	return value, true
}

func getQueryParam(w http.ResponseWriter, r *http.Request, name string) (string, bool) {
	params := r.URL.Query()
	param := params.Get(name)
	if len(param) == 0 {
		respond(w, http.StatusBadRequest, fmt.Sprintf("bad request: missing %s", name))
		return "", false
	}
	return param, true
}

func corsMiddleware(next http.Handler) http.Handler {
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

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		writer := &LoggingResponseWriter{w: w, statusCode: 0}
		next.ServeHTTP(writer, r)
		log.Printf("%d %s %s\n", writer.statusCode, r.Method, r.URL.Path)
	})
}

func main() {
	api, err := NewAPI()
	if err != nil {
		log.Fatal(err.Error())
	}
	defer api.Cleanup()

	// TODO: log endpoints as they're being requested

	mux := http.NewServeMux()
	mux.HandleFunc("POST /auth/login", api.Login)
	mux.HandleFunc("POST /auth/new", api.CreateAccount)
	mux.HandleFunc("POST /auth/issue", api.IssueToken)

	mux.HandleFunc("POST /food/new", api.CreateFood)
	mux.HandleFunc("GET /food/search", api.SearchFood)

	mux.HandleFunc("POST /user/data", api.UserData)

	handler := loggingMiddleware(corsMiddleware(mux))
	log.Println("Server starting at localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", handler))
}
