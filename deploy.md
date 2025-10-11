How to deploy the backend to alwaysdata

The site's type should be "User Program"
The site's environment should look like this:
```
POSTGRES_USER=logbuddy
POSTGRES_PASSWORD=<user password>
POSTGRES_HOSTNAME=postgresql-<user>.alwaysdata.net
POSTGRES_DB=<database_name>
DB_PORT=5432
APP_PORT=8100
JWT_SECRET=supersecret
```

Copy the backend over to alwaysdata using FTP:
```bash
go build .
lftp -u logbuddy ftp-logbuddy.alwaysdata.net
# in the ftp prompt now...
put logbuddy
mirror -R sql sql
```

Check the site's logs for any problems.
