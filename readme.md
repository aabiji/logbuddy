LogBuddy helps you log your workouts, food, weight and period.

TODO (app must be done by Sunday):

BUG: we're still able to use a stale account's jwt after it's deleted

app:
- overhaul styling and design
- build apk
- host backend for free
- better error handling
- consider paginating the /user/data endpoint response
- sync food data when viewing it

// TODO: export data
// TODO: add ui buttons to the weight page (fix it's obvious issue)
// TODO: fix the meals page when there's nothing there...
// TODO: start styling the app -- choose an icon


food page:
- fix the search bug (when you create a meal it doesn't immediately show in search)

exercises page:
- paginate the workouts in the history view

weight page:
- add more weight graph views (this month, last 6 months, all time)
- add checkbox to toggle weekly grouping
- adjust the graph's number of points to the screen's width
- paginate the weight entries

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