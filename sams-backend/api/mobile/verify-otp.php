<?php

declare(strict_types=1);

require_once __DIR__ . '/../../env.php';
require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');

function mobileVerifyOtpResponse(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_THROW_ON_ERROR);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    mobileVerifyOtpResponse(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);

if (!is_array($request)) {
    mobileVerifyOtpResponse(['error' => 'Invalid JSON request.'], 400);
}

$challengeId = (string) ($request['challenge_id'] ?? '');
$otpCode = (string) ($request['code'] ?? '');

if (!preg_match('/^[a-f0-9]{64}$/i', $challengeId) || !preg_match('/^\d{6}$/', $otpCode)) {
    mobileVerifyOtpResponse(['error' => 'A valid challenge ID and six-digit code are required.'], 422);
}

try {
    $database = mobileDatabase();
    $statement = $database->prepare(
        'SELECT c.challenge_id, c.user_id, c.code_hash, u.must_change_password
         FROM mobile_otp_challenges c
         INNER JOIN users u ON u.user_id = c.user_id
         WHERE c.challenge_id = :challenge_id
           AND c.used_at IS NULL
           AND c.expires_at > UTC_TIMESTAMP()
           AND c.attempts < 5
           AND u.is_active = 1
         LIMIT 1'
    );
    $statement->execute([':challenge_id' => $challengeId]);
    $challenge = $statement->fetch();

    if ($challenge === false) {
        mobileVerifyOtpResponse(['error' => 'Invalid or expired verification code.'], 401);
    }

    if (!password_verify($otpCode, $challenge['code_hash'])) {
        $database->prepare(
            'UPDATE mobile_otp_challenges
             SET attempts = attempts + 1
             WHERE challenge_id = :challenge_id'
        )->execute([':challenge_id' => $challengeId]);

        mobileVerifyOtpResponse(['error' => 'Invalid or expired verification code.'], 401);
    }

    $database->beginTransaction();
    $markUsed = $database->prepare(
        'UPDATE mobile_otp_challenges
         SET used_at = UTC_TIMESTAMP()
         WHERE challenge_id = :challenge_id
           AND used_at IS NULL'
    );
    $markUsed->execute([':challenge_id' => $challengeId]);

    if ($markUsed->rowCount() !== 1) {
        $database->rollBack();
        mobileVerifyOtpResponse(['error' => 'Invalid or expired verification code.'], 401);
    }

    $token = mobileCreateAuthSession($database, (int) $challenge['user_id']);
    $database->commit();

    mobileVerifyOtpResponse([
        'token' => $token,
        'must_change_password' => (bool) $challenge['must_change_password'],
    ]);
} catch (Throwable $error) {
    if (isset($database) && $database->inTransaction()) {
        $database->rollBack();
    }

    error_log($error->getMessage());
    mobileVerifyOtpResponse(['error' => 'Authentication service unavailable.'], 500);
}