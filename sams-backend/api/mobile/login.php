<?php

declare(strict_types=1);

require_once __DIR__ . '/../../env.php';
require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../mailer.php';

header('Content-Type: application/json; charset=utf-8');

function mobileLoginResponse(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_THROW_ON_ERROR);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    mobileLoginResponse(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);

if (!is_array($request)) {
    mobileLoginResponse(['error' => 'Invalid JSON request.'], 400);
}

$email = strtolower(trim((string) ($request['email'] ?? '')));
$password = (string) ($request['password'] ?? '');

if ($email === '' || $password === '') {
    mobileLoginResponse(['error' => 'Email and password are required.'], 422);
}

try {
    $database = mobileDatabase();
    $statement = $database->prepare(
        'SELECT user_id, email, password_hash, role, is_active, must_change_password
         FROM users
         WHERE email = :email
         LIMIT 1'
    );
    $statement->execute([':email' => $email]);
    $user = $statement->fetch();

    if ($user === false || (int) $user['is_active'] !== 1 || !password_verify($password, $user['password_hash'])) {
        mobileLoginResponse(['error' => 'Invalid credentials.'], 401);
    }

    // All users now require OTP verification for security
    // This includes admin and supervisor roles as well
    // if ($user['role'] !== 'student') {
    //     mobileLoginResponse([
    //         'token' => mobileCreateAuthSession($database, (int) $user['user_id']),
    //         'must_change_password' => (bool) $user['must_change_password'],
    //     ]);
    // }

    $challengeId = bin2hex(random_bytes(32));
    $otpCode = (string) random_int(100000, 999999);
    // OTP valid for 15 minutes (was 10, extending for better UX)
    $expiresAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
        ->modify('+15 minutes')
        ->format('Y-m-d H:i:s');

    $database->beginTransaction();
    $database->prepare(
        'UPDATE mobile_otp_challenges
         SET used_at = UTC_TIMESTAMP()
         WHERE user_id = :user_id
           AND used_at IS NULL'
    )->execute([':user_id' => $user['user_id']]);

    $database->prepare(
        'INSERT INTO mobile_otp_challenges
         (challenge_id, user_id, code_hash, expires_at)
         VALUES (:challenge_id, :user_id, :code_hash, :expires_at)'
    )->execute([
        ':challenge_id' => $challengeId,
        ':user_id' => $user['user_id'],
        ':code_hash' => hash('sha256', $otpCode),
        ':expires_at' => $expiresAt,
    ]);
    $database->commit();

    // Send email asynchronously in background to avoid blocking the login response
    // This allows the app to receive the OTP challenge immediately while the email
    // is queued/sent in the background
    $emailBody = "Hello,\n\n"
        . "Someone just tried to log into your NU SAMS account. To verify this is you, enter this code:\n\n"
        . "Verification Code: {$otpCode}\n\n"
        . "This code will expire in 10 minutes.\n\n"
        . "If you did not attempt to log in, you can safely ignore this email. Your account is secure.\n\n"
        . "For security reasons, NU SAMS will never ask for your verification code via phone, email, or chat. Do not share this code with anyone.\n\n"
        . "Best regards,\n"
        . "NU SAMS Security Team";

    // Queue email to send in background (non-blocking)
    // In production, this would use a job queue; for now, we attempt async send
    if (function_exists('proc_open')) {
        $mailScript = __DIR__ . '/../../send-otp-email.php';
        $cmd = sprintf(
            'php %s %s %s %s %s',
            escapeshellarg($mailScript),
            escapeshellarg($user['email']),
            escapeshellarg('NU SAMS Email Verification Code'),
            escapeshellarg($emailBody),
            escapeshellarg(getenv('SAMS_OTP_DEBUG') === 'true' ? '1' : '0')
        );
        // Non-blocking process spawn
        $proc = proc_open($cmd, [], $pipes, null, null);
        if (is_resource($proc)) {
            proc_close($proc);
        }
    } else {
        // Fallback: try to send synchronously (PHP without proc_open support)
        mobileSendMail(
            $user['email'],
            'NU SAMS Email Verification Code',
            $emailBody
        );
    }

    // Return OTP challenge immediately without waiting for email delivery
    mobileLoginResponse([
        'otp_pending' => true,
        'challenge_id' => $challengeId,
        'expires_in' => 600,
        // Only include debug code if explicitly enabled and in debug mode
        ...(getenv('SAMS_OTP_DEBUG') === 'true' ? ['debug_otp' => $otpCode] : []),
    ]);
} catch (RuntimeException $error) {
    // Database credentials or environment configuration error
    error_log('Database Config Error: ' . $error->getMessage());
    mobileLoginResponse([
        'error' => $error->getMessage(),
        'type' => 'configuration_error',
    ], 500);
} catch (PDOException $error) {
    // Database connection error
    if (isset($database) && $database->inTransaction()) {
        try {
            $database->rollBack();
        } catch (Throwable) {
            // Ignore rollback errors
        }
    }
    error_log('Database Connection Error: ' . $error->getMessage());
    mobileLoginResponse([
        'error' => $error->getMessage(),
        'type' => 'database_connection_error',
    ], 503);
} catch (Throwable $error) {
    // Any other error (OTP processing, email, etc.)
    if (isset($database) && $database->inTransaction()) {
        try {
            $database->rollBack();
        } catch (Throwable) {
            // Ignore rollback errors
        }
    }
    error_log('Login Error: ' . $error->getMessage());
    mobileLoginResponse([
        'error' => 'An unexpected error occurred. Please try again.',
        'type' => 'unknown_error',
        'debug_message' => $error->getMessage(),
    ], 500);
}