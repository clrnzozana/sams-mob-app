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
    // First check if challenge exists (expired or used)
    $checkStatement = $database->prepare(
        'SELECT c.challenge_id, c.user_id, c.code_hash, c.expires_at, c.used_at, c.attempts
         FROM mobile_otp_challenges c
         WHERE c.challenge_id = :challenge_id
         LIMIT 1'
    );
    $checkStatement->execute([':challenge_id' => $challengeId]);
    $existingChallenge = $checkStatement->fetch();
    
    // Challenge doesn't exist
    if ($existingChallenge === false) {
        mobileVerifyOtpResponse([
            'error' => 'This verification code does not exist. Please log in again.',
            'type' => 'invalid_challenge'
        ], 401);
    }
    
    // Challenge already used
    if ($existingChallenge['used_at'] !== null) {
        mobileVerifyOtpResponse([
            'error' => 'This verification code has already been used. Please log in again.',
            'type' => 'code_already_used'
        ], 401);
    }
    
    // Challenge expired
    if (strtotime($existingChallenge['expires_at']) <= time()) {
        mobileVerifyOtpResponse([
            'error' => 'This verification code has expired. Please request a new one by logging in again.',
            'type' => 'code_expired',
            'expires_at' => $existingChallenge['expires_at'],
            'current_time' => (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s')
        ], 401);
    }
    
    // Too many attempts
    if ((int) $existingChallenge['attempts'] >= 5) {
        mobileVerifyOtpResponse([
            'error' => 'Too many failed attempts. Please log in again to request a new code.',
            'type' => 'too_many_attempts'
        ], 401);
    }
    
    // Now get the full challenge with user info
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
        mobileVerifyOtpResponse([
            'error' => 'Invalid or expired verification code.',
            'type' => 'invalid_or_expired'
        ], 401);
    }

    $codeHash = hash('sha256', $otpCode);

    if (!hash_equals($challenge['code_hash'], $codeHash)) {
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