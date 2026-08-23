<?php

declare(strict_types=1);

require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';
require_once __DIR__ . '/../../mailer.php';

header('Content-Type: application/json; charset=utf-8');

function passwordResetResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	passwordResetResponse(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);
$email = strtolower(trim((string) (($request['email'] ?? '') ?: '')));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
	passwordResetResponse(['error' => 'A valid email address is required.'], 422);
}

try {
	$database = mobileDatabase();
	$statement = $database->prepare(
		'SELECT user_id, email FROM users
		 WHERE email = :email AND is_active = 1 LIMIT 1'
	);
	$statement->execute([':email' => $email]);
	$user = $statement->fetch();

	if ($user !== false) {
		$token = bin2hex(random_bytes(32));
		$expiresAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
			->modify('+1 hour')->format('Y-m-d H:i:s');

		$database->beginTransaction();
		$database->prepare(
			'DELETE FROM password_reset_tokens
			 WHERE user_id = :user_id AND used_at IS NULL'
		)->execute([':user_id' => $user['user_id']]);
		$database->prepare(
			'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
			 VALUES (:user_id, :token_hash, :expires_at)'
		)->execute([
			':user_id' => $user['user_id'],
			':token_hash' => hash('sha256', $token),
			':expires_at' => $expiresAt,
		]);
		$database->commit();

		$resetUrl = getenv('SAMS_PASSWORD_RESET_URL') ?: 'http://localhost/sams-backend/reset-password.php?token=' . $token;
		if (!mobileSendMail(
			$user['email'],
			'NU SAMS password reset',
			"Use this link to reset your password: {$resetUrl}\n\nThis link expires in one hour."
		)) {
			passwordResetResponse(['error' => 'Unable to send password reset email.'], 503);
		}
	}

	passwordResetResponse(['message' => 'If an active account uses that email, a password reset link has been sent.']);
} catch (Throwable $error) {
	if (isset($database) && $database->inTransaction()) {
		$database->rollBack();
	}
	error_log($error->getMessage());
	passwordResetResponse(['error' => 'Password reset service unavailable.'], 500);
}
