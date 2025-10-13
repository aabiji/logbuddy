## Deploying the backend to AlwaysData

Create a new site, with the type "User Program".
Set the site's environment to something like this:
```
DB_PORT=5432
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<user password>
POSTGRES_HOSTNAME=postgresql-<user>.alwaysdata.net
POSTGRES_DB=<database name>
JWT_SECRET=something-super-secret
APP_PORT=8100
```

Copy the backend over using FTP:
```bash
# compile a isngle executable instead of using docker
# since alwaysdata provides databases
cd /path/to/logbuddy/backend && go build .

lftp -u <user> ftp-<user>.alwaysdata.net
# in the ftp prompt now...
put logbuddy
mirror -R sql sql
```

Check the site's logs for any problems.
