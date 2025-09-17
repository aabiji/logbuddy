FROM golang:alpine

RUN go install github.com/cespare/reflex@latest

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./

EXPOSE 8080
CMD ["reflex", "-r", "\\.go$", "-s", "--", "sh", "-c", "go run ."]

