<?php

declare(strict_types=1);

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

    if ($user['role'] !== 'student') {
        mobileLoginResponse([
            'token' => mobileCreateAuthSession($database, (int) $user['user_id']),
            'must_change_password' => (bool) $user['must_change_password'],
        ]);
    }

    $challengeId = bin2hex(random_bytes(32));
    $otpCode = (string) random_int(100000, 999999);
    $expiresAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
        ->modify('+10 minutes')
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

    $mailSent = mobileSendMail(
        $user['email'],
        'NU SAMS verification code',
        "Your NU SAMS verification code is {$otpCode}. It expires in 10 minutes."
    );

    if (!$mailSent) {
        if (getenv('SAMS_OTP_DEBUG') !== 'true') {
            mobileLoginResponse(['error' => 'Unable to send verification code.'], 503);
        }

        mobileLoginResponse([
            'otp_pending' => true,
            'challenge_id' => $challengeId,
            'expires_in' => 600,
            'debug_otp' => $otpCode,
        ]);
    }

    mobileLoginResponse([
        'otp_pending' => true,
        'challenge_id' => $challengeId,
        'expires_in' => 600,
    ]);
} catch (Throwable $error) {
    if (isset($database) && $database->inTransaction()) {
        $database->rollBack();
    }

    error_log($error->getMessage());
    mobileLoginResponse(['error' => 'Authentication service unavailable.'], 500);
}