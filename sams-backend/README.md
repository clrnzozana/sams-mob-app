# SAMS Backend

## Local setup

1. Install or start a MariaDB/MySQL server.
2. Create a database named `sams-db`.
3. Import `../sams-db.sql` into that database.
4. Copy `.env.example` to `.env` and fill in the database credentials.
5. Export the variables from `.env` in the terminal before starting PHP. PHP does not load `.env` automatically.

The authentication endpoints are:

- `POST /api/mobile/login.php` — returns `{ otp_pending: true, challenge_id: "..." }` for students, requiring OTP verification
- `POST /api/mobile/verify-otp.php` with `{ "challenge_id": "...", "code": "123456" }` — returns auth token on success
- `POST /api/mobile/resend-otp.php` with `{ "challenge_id": "..." }` — resends the OTP code to the user's email
- `POST /api/mobile/change-password.php`
- `POST /api/mobile/request-password-reset.php` with `{ "email": "student@example.com" }`
- `POST /api/mobile/reset-password.php` with `{ "token": "...", "new_password": "..." }`

The authenticated schedule endpoint is:

- `GET /api/mobile/schedule.php`
- `POST /respond_schedule.php` with `{ "duty_id": 123, "status": "accepted" }` or `"declined"`
- `GET /api/mobile/profile.php`
- `GET /attendance_snapshot.php`
- `GET /announcements/list.php`
- `POST /announcements/mark_read.php` with `{ "notification_id": 123 }`

Email delivery uses PHPMailer over authenticated SMTP. Configure `SAMS_SMTP_HOST`, `SAMS_SMTP_PORT`, `SAMS_SMTP_USER`, `SAMS_SMTP_PASSWORD`, and `SAMS_SMTP_FROM` in the Apache environment. For Gmail, use an App Password rather than the normal account password.

For local-only testing when SMTP is unavailable, set `SAMS_OTP_DEBUG` to `true` in Apache. The login response will include `debug_otp`; disable this setting before any shared or production deployment.

## Authentication policy

**OTP Flow:** Every student login requires email-based OTP verification. After validating email and password, the login endpoint returns a challenge ID and the OTP is sent to the student's registered email. The student then calls verify-otp with the 6-digit code to receive the final auth token.

Mobile sessions use random opaque tokens stored as SHA-256 hashes in `mobile_auth_sessions`. Sessions expire after seven days and are revoked when the password changes. There is no refresh-token endpoint yet; an expired session requires a new login and OTP verification.
