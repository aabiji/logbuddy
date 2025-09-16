FROM golang:alpine

RUN apk add --no-cache git bash curl

RUN go install github.com/cespare/reflex@latest
RUN go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./

EXPOSE 8080
CMD ["reflex", "-r", "\\.go$|\\.sql$", "-s", "--", "sh", "-c", "sqlc generate && go run . | tee /dev/stderr"]

