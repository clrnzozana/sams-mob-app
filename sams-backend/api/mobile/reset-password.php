<?php

declare(strict_types=1);

require_once __DIR__ . '/../../env.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');

function resetPasswordResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	resetPasswordResponse(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);
$token = trim((string) ($request['token'] ?? ''));
$newPassword = (string) ($request['new_password'] ?? '');

if (!preg_match('/^[a-f0-9]{64}$/i', $token)) {
	resetPasswordResponse(['error' => 'A valid reset token is required.'], 422);
}

if (strlen($newPassword) < 8) {
	resetPasswordResponse(['error' => 'Password must be at least 8 characters long.'], 422);
}

try {
	$database = mobileDatabase();
	$statement = $database->prepare(
		'SELECT id, user_id
		 FROM password_reset_tokens
		 WHERE token_hash = :token_hash
		   AND used_at IS NULL
		   AND expires_at > UTC_TIMESTAMP()
		 LIMIT 1'
	);
	$statement->execute([':token_hash' => hash('sha256', $token)]);
	$reset = $statement->fetch();

	if ($reset === false) {
		resetPasswordResponse(['error' => 'Invalid or expired reset token.'], 401);
	}

	$database->beginTransaction();
	$database->prepare(
		'UPDATE users
		 SET password_hash = :password_hash,
			 must_change_password = 0
		 WHERE user_id = :user_id'
	)->execute([
		':password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
		':user_id' => $reset['user_id'],
	]);
	$database->prepare(
		'UPDATE password_reset_tokens
		 SET used_at = UTC_TIMESTAMP()
		 WHERE id = :id AND used_at IS NULL'
	)->execute([':id' => $reset['id']]);
	$database->prepare(
		'UPDATE mobile_auth_sessions
		 SET revoked_at = UTC_TIMESTAMP()
		 WHERE user_id = :user_id AND revoked_at IS NULL'
	)->execute([':user_id' => $reset['user_id']]);
	$database->commit();

	resetPasswordResponse(['password_reset' => true]);
} catch (Throwable $error) {
	if (isset($database) && $database->inTransaction()) {
		$database->rollBack();
	}
	error_log($error->getMessage());
	resetPasswordResponse(['error' => 'Password reset service unavailable.'], 500);
}
