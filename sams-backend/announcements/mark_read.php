<?php

declare(strict_types=1);

require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json; charset=utf-8');

function markReadResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	markReadResponse(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);
$notificationId = filter_var($request['notification_id'] ?? null, FILTER_VALIDATE_INT);

if ($notificationId === false || $notificationId === null) {
	markReadResponse(['error' => 'notification_id is required.'], 422);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		markReadResponse(['error' => 'Authentication required.'], 401);
	}

	$statement = $database->prepare(
		'UPDATE notifications
		 SET is_read = 1
		 WHERE notification_id = :notification_id
		   AND user_id = :user_id'
	);
	$statement->execute([
		':notification_id' => $notificationId,
		':user_id' => $user['user_id'],
	]);

	if ($statement->rowCount() === 0) {
		markReadResponse(['error' => 'Notification not found.'], 404);
	}

	markReadResponse([
		'notification_id' => (int) $notificationId,
		'is_read' => true,
	]);
} catch (Throwable $error) {
	error_log($error->getMessage());
	markReadResponse(['error' => 'Notification service unavailable.'], 500);
}