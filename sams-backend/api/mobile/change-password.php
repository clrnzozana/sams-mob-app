<?php

declare(strict_types=1);

require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';

header('Content-Type: application/json; charset=utf-8');

function mobileChangePasswordResponse(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_THROW_ON_ERROR);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    mobileChangePasswordResponse(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);

if (!is_array($request)) {
    mobileChangePasswordResponse(['error' => 'Invalid JSON request.'], 400);
}

$newPassword = (string) ($request['new_password'] ?? '');

if (strlen($newPassword) < 8) {
    mobileChangePasswordResponse(['error' => 'Password must be at least 8 characters long.'], 422);
}

try {
    $database = mobileDatabase();
    $user = mobileAuthenticate($database);

    if ($user === null) {
        mobileChangePasswordResponse(['error' => 'Authentication required.'], 401);
    }

    $statement = $database->prepare(
        'SELECT password_hash
         FROM users
         WHERE user_id = :user_id
         LIMIT 1'
    );
    $statement->execute([':user_id' => $user['user_id']]);
    $currentPasswordHash = $statement->fetchColumn();

    if (!is_string($currentPasswordHash) || password_verify($newPassword, $currentPasswordHash)) {
        mobileChangePasswordResponse(['error' => 'New password must differ from the current password.'], 422);
    }

    $database->beginTransaction();
    $database->prepare(
        'UPDATE users
         SET password_hash = :password_hash,
             must_change_password = 0
         WHERE user_id = :user_id'
    )->execute([
        ':password_hash' => password_hash($newPassword, PASSWORD_DEFAULT),
        ':user_id' => $user['user_id'],
    ]);
    $database->prepare(
        'UPDATE mobile_auth_sessions
         SET revoked_at = UTC_TIMESTAMP()
         WHERE user_id = :user_id
           AND revoked_at IS NULL'
    )->execute([':user_id' => $user['user_id']]);
    $database->commit();

    mobileChangePasswordResponse([
        'password_changed' => true,
        'reauthenticate' => true,
    ]);
} catch (Throwable $error) {
    if (isset($database) && $database->inTransaction()) {
        $database->rollBack();
    }

    error_log($error->getMessage());
    mobileChangePasswordResponse(['error' => 'Password service unavailable.'], 500);
}