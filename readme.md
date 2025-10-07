LogBuddy helps you log your workouts, food, weight and period.

TODO (app must be done by Sunday):

app:
- consider paginating the /user/data endpoint response
- sync food data when viewing it

food page:
- fix the search bug (when you create a meal it doesn't immediately show in search)

exercises page:
- paginate the workouts in the history view

Create a .env file that looks like this in the project root:
```.env
JWT_SECRET=supersecret
POSTGRES_USER=postgres
POSTGRES_PASSWORD=supersecret
POSTGRES_HOSTNAME=db # same as service
DB_PORT=5432
POSTGRES_DB=db
APP_PORT=8080
```

Create a .env file that looks like this in frontend/ root:
```.env
BACKEND_API_URL=http://localhost:8080
USER_SUPPORT_EMAIL=<YOUR EMAIL>
```

Run the backend:
```bash
cd path/to/logbuddy
sudo docker compose up
```

Run the frontend (web):
```bash
cd path/to/logbuddy/frontend
bun install -g @ionic/cli
bun install
ionic serve
```

Build the frontend (android):
```bash
cd path/to/logbuddy/frontend
bun run build
bunx cap run android
```
* make sure you have android studio installed

Run the frontend with live reloading (android):
```bash
cd path/to/logbuddy/frontend
bun run build

# in one terminal pane
ionic serve --host=0.0.0.0 --port=3000

# in another terminal pane
bunx cap run android -l
```