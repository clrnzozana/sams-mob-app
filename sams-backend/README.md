# SAMS Backend

## Local setup

1. Install or start a MariaDB/MySQL server.
2. Create a database named `sams-db`.
3. Import `../sams-db.sql` into that database.
4. Copy `.env.example` to `.env` and fill in the database credentials.
5. Export the variables from `.env` in the terminal before starting PHP. PHP does not load `.env` automatically.

The authentication endpoints are:

- `POST /api/mobile/login.php`
- `POST /api/mobile/verify-otp.php`
- `POST /api/mobile/change-password.php`

The OTP endpoint uses PHP `mail()`. Configure a mail transport before testing student login. Never commit `.env` or real credentials.

## Authentication policy

Mobile sessions use random opaque tokens stored as SHA-256 hashes in `mobile_auth_sessions`. Sessions expire after seven days and are revoked when the password changes. There is no refresh-token endpoint yet; an expired session requires a new login and OTP verification.