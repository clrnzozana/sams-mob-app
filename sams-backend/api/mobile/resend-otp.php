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
        'SELECT c.challenge_id, c.user_id, c.used_at, c.expires_at, u.email
         FROM mobile_otp_challenges c
         INNER JOIN users u ON u.user_id = c.user_id
         WHERE c.challenge_id = :challenge_id
         LIMIT 1'
    );
    $statement->execute([':challenge_id' => $challengeId]);
    $challenge = $statement->fetch();

    if ($challenge === false || (int) $challenge['used_at'] !== 0) {
        mobileResendOtpResponse(['error' => 'This challenge is no longer valid.'], 410);
    }

    // Check if challenge is still within reasonable bounds (allow resend up to 10 minutes)
    if (strtotime($challenge['expires_at']) < time()) {
        mobileResendOtpResponse(['error' => 'This challenge has expired. Please log in again.'], 410);
    }

    // Generate a new OTP code
    $otpCode = (string) random_int(100000, 999999);
    // OTP valid for 15 minutes (was 10, extending for better UX)
    $expiresAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
        ->modify('+15 minutes')
        ->format('Y-m-d H:i:s');

    // Update the OTP challenge with new code and expiry
    $database->prepare(
        'UPDATE mobile_otp_challenges
         SET code_hash = :code_hash, expires_at = :expires_at, attempts = 0
         WHERE challenge_id = :challenge_id'
    )->execute([
        ':code_hash' => hash('sha256', $otpCode),
        ':challenge_id' => $challengeId,
        ':expires_at' => $expiresAt,
    ]);

    // Queue email to send in background (non-blocking)
    $emailBody = "Your new NU SAMS verification code is: {$otpCode}\n\n"
        . "This code will expire in 10 minutes.\n\n"
        . "If you did not request this code, please ignore this email and do not share it with anyone.\n\n"
        . "For security reasons, NU SAMS will never ask for your verification code via phone, email, or chat.";

    if (function_exists('proc_open')) {
        $mailScript = __DIR__ . '/../../send-otp-email.php';
        $cmd = sprintf(
            'php %s %s %s %s %s',
            escapeshellarg($mailScript),
            escapeshellarg($challenge['email']),
            escapeshellarg('NU SAMS Verification Code (Resent)'),
            escapeshellarg($emailBody),
            escapeshellarg(getenv('SAMS_OTP_DEBUG') === 'true' ? '1' : '0')
        );
        // Non-blocking process spawn
        $proc = proc_open($cmd, [], $pipes, null, null);
        if (is_resource($proc)) {
            proc_close($proc);
        }
    } else {
        // Fallback: try to send synchronously
        mobileSendMail(
            $challenge['email'],
            'NU SAMS Verification Code (Resent)',
            $emailBody
        );
    }

    // Return success immediately without waiting for email delivery
    mobileResendOtpResponse([
        'success' => true,
        'expires_in' => 600,
        // Only include debug code if explicitly enabled
        ...(getenv('SAMS_OTP_DEBUG') === 'true' ? ['debug_otp' => $otpCode] : []),
    ]);
} catch (Throwable $error) {
    error_log($error->getMessage());
    mobileResendOtpResponse(['error' => 'Authentication service unavailable.'], 500);
}
