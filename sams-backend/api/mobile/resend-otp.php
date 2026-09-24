<?php

declare(strict_types=1);

require_once __DIR__ . '/../../env.php';
require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../mailer.php';

header('Content-Type: application/json; charset=utf-8');

function mobileResendOtpResponse(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_THROW_ON_ERROR);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    mobileResendOtpResponse(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);

if (!is_array($request)) {
    mobileResendOtpResponse(['error' => 'Invalid JSON request.'], 400);
}

$challengeId = (string) ($request['challenge_id'] ?? '');

if (!preg_match('/^[a-f0-9]{64}$/i', $challengeId)) {
    mobileResendOtpResponse(['error' => 'A valid challenge ID is required.'], 422);
}

try {
    $database = mobileDatabase();
    $statement = $database->prepare(
        'SELECT c.challenge_id, c.user_id, u.email, u.role, u.is_active
         FROM mobile_otp_challenges c
         INNER JOIN users u ON u.user_id = c.user_id
         WHERE c.challenge_id = :challenge_id
           AND c.used_at IS NULL
           AND u.is_active = 1
         LIMIT 1'
    );
    $statement->execute([':challenge_id' => $challengeId]);
    $challenge = $statement->fetch();

    if ($challenge === false) {
        mobileResendOtpResponse(['error' => 'Session expired or invalid. Please log in again.'], 404);
    }

    $otpCode = (string) random_int(100000, 999999);
    $expiresAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
        ->modify('+10 minutes')
        ->format('Y-m-d H:i:s');

    $update = $database->prepare(
        'UPDATE mobile_otp_challenges
         SET code_hash = :code_hash,
             expires_at = :expires_at,
             attempts = 0
         WHERE challenge_id = :challenge_id'
    );
    $update->execute([
        ':challenge_id' => $challengeId,
        ':code_hash' => password_hash($otpCode, PASSWORD_DEFAULT),
        ':expires_at' => $expiresAt,
    ]);

    $mailSent = mobileSendOtpEmail($challenge['email'], $otpCode);
    error_log("[sams-auth] Resent OTP for {$challenge['email']}: {$otpCode} | Email Sent: " . ($mailSent ? 'SUCCESS' : 'FAILED'));

    $isDebug = getenv('SAMS_OTP_DEBUG') === 'true';

    if (!$mailSent && !$isDebug) {
        mobileResendOtpResponse([
            'error' => 'Unable to send verification code to ' . $challenge['email'] . '. Please check SMTP configuration.',
        ], 503);
    }

    $payload = [
        'success' => true,
        'message' => 'Verification code sent to your registered email.',
        'challenge_id' => $challengeId,
        'email' => $challenge['email'],
        'expires_in' => 600,
        'mail_sent' => $mailSent,
    ];

    mobileResendOtpResponse($payload);
} catch (Throwable $error) {
    error_log($error->getMessage());
    mobileResendOtpResponse(['error' => 'Unable to resend verification code.'], 500);
}
