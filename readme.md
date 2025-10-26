LogBuddy is a simple app that helps you log your workouts, food consumption, weight and period.
It has a Golang backend, with an Ionic frontend, using PostgreSQL as its database.

### Run
Run the backend (be sure to edit .env and frontend/.env):
```bash
cd path/to/logbuddy && ./run-backend.sh
```

Create an android debug build:
```bash
cd path/to/logbuddy/frontend

bun install -g @ionic/cli
bun install && bun run build

# build once with live reloading
bunx cap run android -l

# serve the frontend exposed on the local network
ionic serve --host=0.0.0.0 --port=3000
```

Create an android production build:
```bash
bun remove capacitor-assets 2>/dev/null || true
bun add -D @capacitor/assets

bunx cap add android
bun install
bun run build
bunx @capacitor/assets generate --iconBackgroundColor "#00BCD4"
bunx cap sync android
cd android && ./gradlew assembleDebug && cd ..

adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```
