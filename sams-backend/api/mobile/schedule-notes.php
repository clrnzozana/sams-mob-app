<?php

declare(strict_types=1);

require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');

function notesResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
	notesResponse(['error' => 'Method not allowed.'], 405);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		notesResponse(['error' => 'Authentication required.'], 401);
	}

	if ($user['role'] !== 'student') {
		notesResponse(['error' => 'Student access required.'], 403);
	}

	$dutyNotes = $database->prepare(
		'SELECT n.note_id, n.duty_id, n.schedule_date, n.reason,
				n.status, n.admin_reply, n.created_at, n.updated_at
		 FROM duty_schedule_notes n
		 INNER JOIN applications a ON a.application_id = n.application_id
			 AND a.status = :approved_status
		 INNER JOIN students s ON s.student_id = a.student_id
			 AND s.is_enrolled = 1
		 WHERE s.user_id = :user_id
		 ORDER BY n.schedule_date DESC, n.note_id DESC'
	);
	$dutyNotes->execute([
		':approved_status' => 'approved',
		':user_id' => $user['user_id'],
	]);

	$notes = array_map(
		static function (array $note): array {
			return [
				'note_id' => (int) $note['note_id'],
				'duty_id' => (int) $note['duty_id'],
				'schedule_date' => $note['schedule_date'],
				'reason' => $note['reason'],
				'status' => $note['status'],
				'admin_reply' => $note['admin_reply'],
				'created_at' => $note['created_at'],
				'updated_at' => $note['updated_at'],
			];
		},
		$dutyNotes->fetchAll(PDO::FETCH_ASSOC)
	);

	notesResponse(['notes' => $notes]);
} catch (Throwable $error) {
	error_log($error->getMessage());
	notesResponse(['error' => 'Schedule notes service unavailable.'], 500);
}
