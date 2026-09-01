# IMMEDIATE ACTIONS - Do This Now

Follow these steps in order to fix the authentication issues.

## Action 1: Restart Backend Server

**In your backend terminal** (where `npm run start-backend` is running):

1. Press `Ctrl+C` to stop it
2. Run again:
   ```powershell
   npm run start-backend
   ```

The backend will now load the `.env` file properly.

## Action 2: Check Configuration Status

Open **a new PowerShell** and run:

```powershell
curl http://192.168.1.7:8000/diagnostics.php | ConvertFrom-Json | Format-Table -AutoSize
```

You should see something like:

```
status     : ok
message    : Backend is ready for authentication
timestamp  : 2026-09-01 10:30:45

Name                    Value
----                    -----
env_loaded              @{ok=True; message=.env file loaded successfully}
db_credentials          @{ok=True; message=Database user configured: root}
db_connection           @{ok=True; message=Database connection successful}
test_data               @{ok=True; message=Database has 1 user(s)}
```

**If you see errors:**

- Read the error message carefully
- Check the "troubleshooting" suggestions provided
- Follow the "Next Steps" if shown

## Action 3: Test Login

**In your app (Expo/Android emulator):**

Try logging in with:

- Email: `test@test.com`
- Password: `password123`

**You should now see:**

- ✅ "Invalid credentials" if email/password is wrong (CLEAR ERROR MESSAGE)
- ✅ OTP code sent to email if correct credentials
- ✅ Ability to verify OTP with 6-digit code

## Action 4: Add Your Own Test User (Optional)

If you want to use different credentials, add a test user to database:

```powershell
# Connect to database
mysql -u root -p sams-db

# Paste this command (one at a time or all together):
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active, must_change_password)
VALUES ('student@university.edu', '$2y$12$oP8QUlZxEKaDSLvXdlUXa.A1ygXH1a5tpIQY2/Zf9SxxLi1rS7zP2', 'student', 'John', 'Doe', 1, 1);

# Exit MySQL
EXIT;
```

Then login with:

- Email: `student@university.edu`
- Password: `password123`

## What's Different Now

| Before                                                   | After                                                         |
| -------------------------------------------------------- | ------------------------------------------------------------- |
| ❌ "Authentication service unavailable" (for everything) | ✅ Clear error messages for each issue                        |
| ❌ Can't tell if problem is database or credentials      | ✅ Diagnostics endpoint tells you exactly what's wrong        |
| ❌ OTP fails because database won't connect              | ✅ OTP works because database credentials are properly loaded |
| ❌ No way to debug backend issues                        | ✅ `/diagnostics.php` shows configuration status              |

## Problems & Solutions

| You See                                       | Solution                                                                    |
| --------------------------------------------- | --------------------------------------------------------------------------- |
| diagnostics says "SAMS_DB_USER not set"       | Edit `.env` file and set `SAMS_DB_USER=root`                                |
| diagnostics says "Database connection failed" | Start MySQL service: `Get-Service MySQL* \| Start-Service`                  |
| diagnostics says "No users in database"       | Import schema: `mysql -u root -p sams-db < sams-db.sql`                     |
| Login shows "Invalid credentials"             | Check email/password are correct (test user is test@test.com / password123) |
| Login shows "OTP verification failed"         | OTP expires after 10 minutes, click "Resend" and try again                  |

## Questions?

1. Check [AUTHENTICATION_FIX.md](AUTHENTICATION_FIX.md) for detailed explanation
2. Read [QUICK_START.md](QUICK_START.md) for complete setup guide
3. Run diagnostics endpoint to see what's configured

**The system should now work correctly!**
