# Backend Database Setup Guide

The "failed to fetch" error means either:

1. **Backend server is not running**, OR
2. **Database is not configured**

Follow these steps to fix it.

## Step 1: Verify PHP is Running

Check that `npm run start-backend` is running in a terminal. You should see:

```
PHP 8.2.12 Development Server (http://0.0.0.0:8000) started
```

If not, run it now:

```bash
npm run start-backend
```

## Step 2: Create Database Credentials File

The backend needs a `.env` file with database credentials.

### Quick Setup (Windows)

Run this in the project root:

```bash
npm run setup-backend
```

This will open `.env` in Notepad. Edit it and add your database credentials.

### Manual Setup

1. Copy template:

```bash
cd sams-backend
copy .env.example .env
```

2. Edit `.env` with your database credentials:

```
SAMS_DB_HOST=127.0.0.1
SAMS_DB_PORT=3306
SAMS_DB_NAME=sams-db
SAMS_DB_USER=root
SAMS_DB_PASSWORD=
```

## Step 3: Check MySQL/MariaDB is Running

You need MySQL or MariaDB installed and running.

### Windows - Check MySQL Service

```powershell
Get-Service MySQL* -ErrorAction SilentlyContinue
Get-Service Maria* -ErrorAction SilentlyContinue
```

If not running, start it (depends on your installation):

- MySQL Community Server: Services app → MySQL → Start
- XAMPP/WAMP: Control panel → Start MySQL

### Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database (in MySQL prompt)
CREATE DATABASE IF NOT EXISTS `sams-db`;
EXIT;

# Import schema
mysql -u root -p sams-db < ../sams-db.sql
```

## Step 4: Restart Backend and Test

1. Kill the running `npm run start-backend` (Ctrl+C)
2. Start it again:

```bash
npm run start-backend
```

3. Test in browser or via curl:

```bash
curl http://192.168.1.7:8000/health.php
```

You should see:

```json
{ "status": "ok", "service": "NU SAMS Mobile Backend", "timestamp": "..." }
```

## Common Database Errors

### Error: "Database credentials are not configured"

- **Fix:** Create `.env` file with `SAMS_DB_USER` and `SAMS_DB_PASSWORD`

### Error: "Connection refused"

- **Fix:** Ensure MySQL/MariaDB is running
- Check: `Get-Service MySQL*` or look in Services

### Error: "Unknown database 'sams-db'"

- **Fix:** Create the database

```bash
mysql -u root -p -e "CREATE DATABASE \`sams-db\`;"
mysql -u root -p sams-db < ../sams-db.sql
```

### Error: "Access denied for user"

- **Fix:** Check SAMS_DB_USER and SAMS_DB_PASSWORD in `.env` match your MySQL login

## Default Test Credentials

Once database is set up, you can test login with a database query:

```sql
-- Check if test users exist
SELECT * FROM users LIMIT 5;

-- If empty, you need to insert test data
-- (Check SAMS Capstone.txt or ask your team for test data)
```

## Still Getting "Failed to Fetch"?

1. ✅ Backend running? Check terminal shows "PHP Development Server started"
2. ✅ Database configured? Check `.env` file exists with SAMS_DB_USER and SAMS_DB_PASSWORD
3. ✅ MySQL running? Check Services or XAMPP control panel
4. ✅ Database created? Run: `mysql -u root -p -e "SHOW DATABASES;"`
5. ✅ Network accessible? Test: `curl http://192.168.1.7:8000/health.php`

If health endpoint returns `{"status":"ok"...}` but login fails:

- Database credentials are wrong in `.env`
- MySQL service is not actually running
- Database doesn't exist yet
