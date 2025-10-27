<p align="center">
  <img src="images/banner.png" alt="LogBuddy Banner" width="700">
</p>

A simple health tracking app for monitoring your nutrition, workouts, weight, and period.
Checkout the [github releases](https://github.com/aabiji/logbuddy/releases/) for the android apk.

<p align="center">
  <img src="images/screen-banner.png" alt="LogBuddy Screens" width="800">
</p>

### Develop
LogBuddy was built using Golang for the backend, Ionic for the frontend and PostgreSQL as the database.
You might also need to install Android Studio for Android builds.

Run the backend (be sure to edit the generated .env and frontend/.env):
```bash
cd path/to/logbuddy && ./run-backend.sh
```

Run an android debug build with live reloading:
```bash
cd path/to/logbuddy/frontend

bun install -g @ionic/cli
bun install && bun run build

# build once with live reloading
bunx cap run android -l

# serve the frontend exposed on the local network
ionic serve --host=0.0.0.0 --port=3000
```

Contributions are welcome! Please feel free to submit a pull request.
