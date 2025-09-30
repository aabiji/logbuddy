LogBuddy helps you log your workouts, food, weight and period.

Create a .env file that looks like so:
```.env
JWT_SECRET=supersecret
POSTGRES_USER=postgres
POSTGRES_PASSWORD=supersecret
POSTGRES_HOSTNAME=db # same as service
DB_PORT=5432
POSTGRES_DB=db
APP_PORT=8080
```

Run the frontend:
```bash
cd path/to/logbuddy/frontend
bun install -g @ionic/cli
bun install
ionic serve
```

Run the backend:
```bash
cd path/to/logbuddy
sudo docker compose up
```
