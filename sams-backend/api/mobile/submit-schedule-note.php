<?php

declare(strict_types=1);

require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');

function noteResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	noteResponse(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);

if (!is_array($request)) {
	noteResponse(['error' => 'Request body must be valid JSON.'], 400);
}

$dutyId = filter_var($request['duty_id'] ?? null, FILTER_VALIDATE_INT);
$scheduleDate = trim((string) ($request['schedule_date'] ?? ''));
$reason = trim((string) ($request['reason'] ?? ''));

if ($dutyId === false || $dutyId === null || $scheduleDate === '' || $reason === '') {
	noteResponse([
		'error' => 'duty_id, schedule_date (YYYY-MM-DD), and reason are required.',
	], 422);
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $scheduleDate)) {
	noteResponse([
		'error' => 'schedule_date must be in YYYY-MM-DD format.',
	], 422);
}

if (mb_strlen($reason) < 5) {
	noteResponse([
		'error' => 'Reason must be at least 5 characters long.',
	], 422);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		noteResponse(['error' => 'Authentication required.'], 401);
	}

	if ($user['role'] !== 'student') {
		noteResponse(['error' => 'Student access required.'], 403);
	}

	// Verify duty belongs to student and is deployed or accepted
	$dutyStatement = $database->prepare(
		'SELECT d.duty_id, d.application_id, d.office_name, d.day_of_week,
				d.start_time, d.end_time, d.status,
				s.student_id_number, u.first_name, u.last_name
		 FROM duty_schedules d
		 INNER JOIN applications a ON a.application_id = d.application_id
			 AND a.status = :approved_status
		 INNER JOIN students s ON s.student_id = a.student_id
			 AND s.is_enrolled = 1
		 INNER JOIN users u ON u.user_id = s.user_id
		 WHERE d.duty_id = :duty_id
		   AND s.user_id = :user_id'
	);
	$dutyStatement->execute([
		':approved_status' => 'approved',
		':duty_id' => $dutyId,
		':user_id' => $user['user_id'],
	]);
	$duty = $dutyStatement->fetch(PDO::FETCH_ASSOC);

	if ($duty === false) {
		noteResponse([
			'error' => 'Duty schedule not found or does not belong to you.',
		], 404);
	}

	if ($duty['status'] !== 'deployed') {
		noteResponse([
			'error' => 'Excuse notes can only be filed for actively deployed duty schedules. Approved schedules that are not yet deployed cannot be excused.',
		], 403);
	}

	$applicationId = (int) $duty['application_id'];

	// Upsert into duty_schedule_notes
	$upsertStatement = $database->prepare(
		'INSERT INTO duty_schedule_notes (
			duty_id,
			application_id,
			schedule_date,
			reason,
			status
		) VALUES (
			:duty_id,
			:application_id,
			:schedule_date,
			:reason,
			:status
		)
		ON DUPLICATE KEY UPDATE
			reason = VALUES(reason),
			status = "pending",
			updated_at = CURRENT_TIMESTAMP'
	);
	$upsertStatement->execute([
		':duty_id' => $dutyId,
		':application_id' => $applicationId,
		':schedule_date' => $scheduleDate,
		':reason' => $reason,
		':status' => 'pending',
	]);

	// Fetch the saved note
	$fetchNote = $database->prepare(
		'SELECT note_id, duty_id, application_id, schedule_date,
				reason, status, admin_reply, created_at, updated_at
		 FROM duty_schedule_notes
		 WHERE duty_id = :duty_id
		   AND schedule_date = :schedule_date'
	);
	$fetchNote->execute([
		':duty_id' => $dutyId,
		':schedule_date' => $scheduleDate,
	]);
	$savedNote = $fetchNote->fetch(PDO::FETCH_ASSOC);

	// Send notification to all administrators
	$studentName = trim($duty['first_name'] . ' ' . $duty['last_name']);
	$notifTitle = "Schedule Excuse Note: {$studentName}";
	$notifMessage = "Student {$studentName} ({$duty['student_id_number']}) submitted an excuse note for {$duty['day_of_week']}, {$scheduleDate} ({$duty['office_name']} " . substr($duty['start_time'], 0, 5) . "-" . substr($duty['end_time'], 0, 5) . "): \"{$reason}\". Please review to excuse or adjust schedule.";

	$adminUsers = $database->query(
		'SELECT user_id FROM users WHERE role = "admin"'
	)->fetchAll(PDO::FETCH_ASSOC);

	$notifStatement = $database->prepare(
		'INSERT INTO notifications (user_id, title, message, notification_type, is_read)
		 VALUES (:user_id, :title, :message, :type, 0)'
	);

	foreach ($adminUsers as $admin) {
		$notifStatement->execute([
			':user_id' => $admin['user_id'],
			':title' => $notifTitle,
			':message' => $notifMessage,
			':type' => 'schedule',
		]);
	}

	noteResponse([
		'success' => true,
		'message' => 'Excuse note submitted successfully. Administrators have been notified.',
		'note' => [
			'note_id' => (int) $savedNote['note_id'],
			'duty_id' => (int) $savedNote['duty_id'],
			'schedule_date' => $savedNote['schedule_date'],
			'reason' => $savedNote['reason'],
			'status' => $savedNote['status'],
			'admin_reply' => $savedNote['admin_reply'],
			'created_at' => $savedNote['created_at'],
			'updated_at' => $savedNote['updated_at'],
		],
	], 201);
} catch (Throwable $error) {
	error_log($error->getMessage());
	noteResponse(['error' => 'Schedule note submission unavailable.'], 500);
}
