# Quick Start: Fix "Failed to Fetch" Error

Follow these steps in order. Open PowerShell and run each command.

## Step 1: Check MySQL is Running

```powershell
Get-Service MySQL* -ErrorAction SilentlyContinue | Select-Object Name, Status
Get-Service Maria* -ErrorAction SilentlyContinue | Select-Object Name, Status
```

If no service appears, MySQL/MariaDB isn't installed. Install from:

- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- [MariaDB](https://mariadb.org/download/)
- Or use XAMPP/WAMP which includes MySQL

## Step 2: Create Database (One-time Setup)

```powershell
# Create the database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS \`sams-db\`;"

# When prompted for password, press Enter if no password set, or enter your password
```

When prompted, enter your MySQL root password (or press Enter if no password).

Then import the schema:

```powershell
cd c:\Users\zaban\Documents\SAMS\sams-mobile
mysql -u root -p sams-db < .\sams-db.sql
```

## Step 3: Configure Backend Credentials

```powershell
cd c:\Users\zaban\Documents\SAMS\sams-mobile
npm run setup-backend
```

This opens `.env` in Notepad. Fill in:

```
SAMS_DB_USER=root
SAMS_DB_PASSWORD=
```

If you have a MySQL password, put it in `SAMS_DB_PASSWORD`.

Save the file (Ctrl+S) and close Notepad.

## Step 4: Start Backend Server

```powershell
cd c:\Users\zaban\Documents\SAMS\sams-mobile
npm run start-backend
```

You should see:

```
[Tue Sep  1 09:49:21 2026] PHP 8.2.12 Development Server (http://0.0.0.0:8000) started
```

Leave this terminal running.

## Step 4b: Verify Backend is Ready (IMPORTANT!)

Open **another PowerShell** and run:

```powershell
curl http://192.168.1.7:8000/diagnostics.php | ConvertFrom-Json | ConvertTo-Json
```

This will show you if everything is configured correctly:

- ✅ `status: "ok"` means backend is ready for login
- ❌ `status: "error"` means there's a configuration issue - read the error messages carefully

**Common diagnostic errors:**

- **"SAMS_DB_USER not set"** → Edit `.env` and add `SAMS_DB_USER=root`
- **"Database connection failed"** → MySQL/MariaDB isn't running or credentials are wrong
- **"No users in database"** → Run the "Add Test User" section below

Do NOT proceed until diagnostics shows `"status": "ok"`

## Step 5: Start Mobile App (New Terminal)

Open a **new PowerShell** window:

```powershell
cd c:\Users\zaban\Documents\SAMS\sams-mobile
npm start
```

Press `a` for Android or `i` for iOS.

## Step 6: Test Login

Try logging in with test credentials. If you don't have test data:

Open **another terminal** and add a test user:

```bash
mysql -u root -p sams-db
```

Then paste:

```sql
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active, must_change_password)
VALUES ('test@test.com', '$2y$12$oP8QUlZxEKaDSLvXdlUXa.A1ygXH1a5tpIQY2/Zf9SxxLi1rS7zP2', 'student', 'Test', 'User', 1, 1);
```

Exit MySQL:

```
EXIT;
```

Then try logging in with:

- Email: `test@test.com`
- Password: `password123`

## Troubleshooting

### Check backend diagnostics first (Always start here!)

```powershell
curl http://192.168.1.7:8000/diagnostics.php | ConvertFrom-Json | ConvertTo-Json
```

This tells you exactly what's wrong.

### "Server not properly configured"

- **Cause:** Database credentials missing from `.env` file
- **Fix:**
  ```powershell
  cd sams-backend
  notepad .env
  ```
  Make sure `SAMS_DB_USER=root` is set (or your MySQL username)

### "Cannot connect to authentication service"

- **Cause:** MySQL/MariaDB isn't running
- **Fix:**
  1. Open Services (Windows key → "Services")
  2. Find MySQL or MariaDB service
  3. Right-click → Start
  4. Or use: `Get-Service MySQL* | Start-Service`

### "Invalid credentials" when logging in

- **Cause:** Wrong email or password
- **Fix:** Use the correct test credentials, or add a new test user (see "Add Test User" section)

### "OTP verification failed"

- **Cause:** OTP code expired (10 minute window) or code is wrong
- **Fix:** Click "Resend OTP" in the app and check your email

### Health endpoint works but login fails

- **Cause:** Database exists but either:
  1. No test users in database
  2. Table schema incomplete
- **Fix:**
  ```powershell
  mysql -u root -p sams-db < .\sams-db.sql
  ```

### Still seeing "Failed to Fetch"

1. Run diagnostics (see above)
2. Backend running? Check terminal shows "PHP Development Server started"
3. Network accessible? Test: `curl http://192.168.1.7:8000/health.php`

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for more detailed help.
