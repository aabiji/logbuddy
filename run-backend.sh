#!/bin/bash
set -e

# Create a default .env file if one doesn't exist:
if [ ! -f .env ]; then
  cat > .env << EOF
JWT_SECRET=something-super-secret
POSTGRES_USER=postgres
POSTGRES_PASSWORD=supersecret
POSTGRES_HOSTNAME=db # same as service
DB_PORT=5432
POSTGRES_DB=db
APP_PORT=8100
EOF
fi

# Create a default .env file for the frontend if one doesn't exist:
if [ ! -f frontend/.env ]; then
  cat > frontend/.env << EOF
BACKEND_API_URL=<BACKEND ADDRESS>
USER_SUPPORT_EMAIL=<YOUR EMAIL>
EOF
fi

# Start/create the backend's docker container
if sudo docker compose ps --quiet 2>/dev/null | grep -q .; then
    sudo docker compose start
    sudo docker compose logs -f
else
    sudo docker compose up
fi
