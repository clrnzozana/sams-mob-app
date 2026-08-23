<?php

declare(strict_types=1);

require_once __DIR__ . '/../auth.php';
require_once __DIR__ . '/../database.php';
require_once __DIR__ . '/../cors.php';

header('Content-Type: application/json; charset=utf-8');

function announcementsResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
	announcementsResponse(['error' => 'Method not allowed.'], 405);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		announcementsResponse(['error' => 'Authentication required.'], 401);
	}

	$statement = $database->prepare(
		'SELECT notification_id, title, message, notification_type, is_read, created_at
		 FROM notifications
		 WHERE user_id = :user_id
		 ORDER BY created_at DESC, notification_id DESC'
	);
	$statement->execute([':user_id' => $user['user_id']]);

	$notifications = array_map(
		static function (array $notification): array {
			return [
				'notification_id' => (int) $notification['notification_id'],
				'title' => $notification['title'],
				'message' => $notification['message'],
				'type' => $notification['notification_type'],
				'is_read' => (bool) $notification['is_read'],
				'created_at' => $notification['created_at'],
			];
		},
		$statement->fetchAll()
	);

	announcementsResponse([
		'unread_count' => count(array_filter($notifications, static fn (array $item): bool => !$item['is_read'])),
		'notifications' => $notifications,
	]);
} catch (Throwable $error) {
	error_log($error->getMessage());
	announcementsResponse(['error' => 'Announcements service unavailable.'], 500);
}
