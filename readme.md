<div style="display: flex; align-items: center; gap: 10px;">
  <img src="frontend/assets/icon.png" width="40" height="40" />
  <h1 style="margin: 0;">LogBuddy</h1>
</div>
LogBuddy is a simple app that helps you log your workouts, food consumption, weight and period.
It has a Golang backend, with an Ionic frontend, using PostgreSQL as its database.

### Deploy the backend
Setup the project:
```bash
# write some backend serets
cat > .env << EOF
JWT_SECRET=supersecret
POSTGRES_USER=postgres
POSTGRES_PASSWORD=supersecret
POSTGRES_HOSTNAME=db # same as service
DB_PORT=5432
POSTGRES_DB=db
APP_PORT=8100
EOF

# write some frontend secrets
cat > frontend/.env << EOF
BACKEND_API_URL=<BACKEND ADDRESS>:8100
USER_SUPPORT_EMAIL=<YOUR EMAIL>
EOF
```

Run locally:
```bash
cd path/to/logbuddy
sudo docker compose up
```

### Build the frontend (android)
Debug build:
```bash
cd path/to/logbuddy/frontend
bun run build

# build once with live reloading
bunx cap run android -l

# serve the frontend exposed on the local network
ionic serve --host=0.0.0.0 --port=3000
```

Production build:
```bash
cd path/to/logbuddy/frontend
bun run build
bunx cap sync android
cd android && ./gradlew assembleDebug && cd ..
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```
