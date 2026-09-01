<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';
require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

function responseSchedule(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	responseSchedule(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);

if (!is_array($request)) {
	responseSchedule(['error' => 'Request body must be valid JSON.'], 400);
}

$dutyId = filter_var($request['duty_id'] ?? null, FILTER_VALIDATE_INT);
$status = $request['status'] ?? null;

if ($dutyId === false || $dutyId === null || !in_array($status, ['accepted', 'declined'], true)) {
	responseSchedule([
		'error' => 'duty_id and status are required. Status must be accepted or declined.',
	], 422);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		responseSchedule(['error' => 'Authentication required.'], 401);
	}

	if ($user['role'] !== 'student') {
		responseSchedule(['error' => 'Student access required.'], 403);
	}

	$updateStatement = $database->prepare(
		'UPDATE duty_schedules d
		 INNER JOIN applications a ON a.application_id = d.application_id
			 AND a.status = :approved_status
		 INNER JOIN students s ON s.student_id = a.student_id
			 AND s.is_enrolled = 1
		 SET d.status = :status,
			 d.student_response_date = UTC_TIMESTAMP()
		 WHERE d.duty_id = :duty_id
		   AND d.term_id = a.term_id
		   AND s.user_id = :user_id
		   AND d.status = :assigned_status'
	);
	$updateStatement->execute([
		':approved_status' => 'approved',
		':status' => $status,
		':duty_id' => $dutyId,
		':user_id' => $user['user_id'],
		':assigned_status' => 'assigned',
	]);

	if ($updateStatement->rowCount() === 0) {
		responseSchedule([
			'error' => 'Duty not found, not assigned to this student, or already answered.',
		], 409);
	}

	responseSchedule([
		'duty_id' => (int) $dutyId,
		'status' => $status,
		'student_response_date' => gmdate('Y-m-d H:i:s'),
	]);
} catch (Throwable $error) {
	error_log($error->getMessage());
	responseSchedule(['error' => 'Schedule response service unavailable.'], 500);
}
