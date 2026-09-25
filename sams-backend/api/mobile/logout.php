<?php

declare(strict_types=1);

require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');

function logoutResponse(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_THROW_ON_ERROR);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    logoutResponse(['error' => 'Method not allowed.'], 405);
}

try {
    $database = mobileDatabase();
    $revoked = mobileRevokeAuthSession($database);

    logoutResponse([
        'success' => true,
        'revoked' => $revoked,
        'message' => 'Logged out successfully.',
    ]);
} catch (Throwable $e) {
    logoutResponse(['error' => 'Unable to complete logout.'], 500);
}
