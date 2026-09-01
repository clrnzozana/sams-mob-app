<?php

declare(strict_types=1);

require_once __DIR__ . '/../../env.php';
require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');

function scheduleResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
	scheduleResponse(['error' => 'Method not allowed.'], 405);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		scheduleResponse(['error' => 'Authentication required.'], 401);
	}

	if ($user['role'] !== 'student') {
		scheduleResponse(['error' => 'Student access required.'], 403);
	}

	$assignmentStatement = $database->prepare(
		'SELECT a.application_id, a.term_id, a.preferred_office,
				t.term_name, t.term_year
		 FROM students s
		 INNER JOIN applications a ON a.student_id = s.student_id
			 AND a.status = :approved_status
		 INNER JOIN terms t ON t.term_id = a.term_id
			 AND t.is_active = 1
		 WHERE s.user_id = :user_id
		   AND s.is_enrolled = 1
		 ORDER BY a.updated_at DESC
		 LIMIT 1'
	);
	$assignmentStatement->execute([
		':approved_status' => 'approved',
		':user_id' => $user['user_id'],
	]);
	$assignment = $assignmentStatement->fetch();

	if ($assignment === false) {
		scheduleResponse(['error' => 'No active student assignment found.'], 404);
	}

	$scheduleStatement = $database->prepare(
		'SELECT duty_id, office_name, day_of_week, start_time, end_time,
				status, student_response_date
		 FROM duty_schedules
		 WHERE application_id = :application_id
		   AND term_id = :term_id
		 ORDER BY FIELD(day_of_week, \'Monday\', \'Tuesday\', \'Wednesday\',
			\'Thursday\', \'Friday\', \'Saturday\'), start_time, duty_id'
	);
	$scheduleStatement->execute([
		':application_id' => $assignment['application_id'],
		':term_id' => $assignment['term_id'],
	]);

	$schedule = array_map(
		static function (array $duty): array {
			return [
				'duty_id' => (int) $duty['duty_id'],
				'office' => $duty['office_name'],
				'day_of_week' => $duty['day_of_week'],
				'start_time' => $duty['start_time'],
				'end_time' => $duty['end_time'],
				'status' => $duty['status'],
				'student_response_date' => $duty['student_response_date'],
			];
		},
		$scheduleStatement->fetchAll()
	);

	scheduleResponse([
		'assignment' => [
			'application_id' => (int) $assignment['application_id'],
			'term_id' => (int) $assignment['term_id'],
			'term' => $assignment['term_name'] . ' ' . $assignment['term_year'],
			'office' => $assignment['preferred_office'],
		],
		'schedule' => $schedule,
	]);
} catch (Throwable $error) {
	error_log($error->getMessage());
	scheduleResponse(['error' => 'Schedule service unavailable.'], 500);
}