<?php

declare(strict_types=1);

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

function attendanceResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
	attendanceResponse(['error' => 'Method not allowed.'], 405);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		attendanceResponse(['error' => 'Authentication required.'], 401);
	}

	if ($user['role'] !== 'student') {
		attendanceResponse(['error' => 'Student access required.'], 403);
	}

	$assignmentStatement = $database->prepare(
		'SELECT a.application_id, a.term_id, t.term_name, t.term_year
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
		attendanceResponse(['error' => 'No active student assignment found.'], 404);
	}

	$logStatement = $database->prepare(
		'SELECT l.log_id, l.clock_in_time, l.clock_out_time, l.status,
				l.late_minutes, d.office_name, d.day_of_week,
				ROUND(CASE WHEN l.clock_out_time IS NULL THEN 0
					ELSE TIMESTAMPDIFF(SECOND, l.clock_in_time, l.clock_out_time) / 3600 END, 2) AS hours
		 FROM attendance_logs l
		 LEFT JOIN duty_schedules d ON d.duty_id = l.duty_id
		 WHERE l.application_id = :application_id
		   AND l.term_id = :term_id
		 ORDER BY l.clock_in_time DESC, l.log_id DESC'
	);
	$logStatement->execute([
		':application_id' => $assignment['application_id'],
		':term_id' => $assignment['term_id'],
	]);

	$logs = array_map(
		static function (array $log): array {
			return [
				'log_id' => (int) $log['log_id'],
				'date' => $log['clock_in_time'],
				'day' => $log['day_of_week'],
				'clock_in' => $log['clock_in_time'],
				'clock_out' => $log['clock_out_time'],
				'hours' => (float) $log['hours'],
				'status' => $log['status'],
				'late_minutes' => (int) ($log['late_minutes'] ?? 0),
				'office' => $log['office_name'],
			];
		},
		$logStatement->fetchAll()
	);

	$summaryStatement = $database->prepare(
		'SELECT COUNT(*) AS total_records,
				SUM(status = \'present\') AS present,
				SUM(status = \'late\') AS late,
				SUM(status = \'absent\') AS absent,
				SUM(status = \'incomplete\') AS incomplete,
				COALESCE(SUM(CASE WHEN clock_out_time IS NULL THEN 0
					ELSE TIMESTAMPDIFF(SECOND, clock_in_time, clock_out_time) / 3600 END), 0) AS rendered_hours
		 FROM attendance_logs
		 WHERE application_id = :application_id
		   AND term_id = :term_id'
	);
	$summaryStatement->execute([
		':application_id' => $assignment['application_id'],
		':term_id' => $assignment['term_id'],
	]);
	$summary = $summaryStatement->fetch() ?: [];
	$totalRecords = (int) ($summary['total_records'] ?? 0);
	$present = (int) ($summary['present'] ?? 0);
	$late = (int) ($summary['late'] ?? 0);

	attendanceResponse([
		'term' => $assignment['term_name'] . ' ' . $assignment['term_year'],
		'summary' => [
			'total_records' => $totalRecords,
			'present' => $present,
			'late' => $late,
			'absent' => (int) ($summary['absent'] ?? 0),
			'incomplete' => (int) ($summary['incomplete'] ?? 0),
			'attendance_rate' => $totalRecords > 0 ? round((($present + $late) / $totalRecords) * 100, 1) : 0,
			'rendered_hours' => (float) ($summary['rendered_hours'] ?? 0),
		],
		'logs' => $logs,
	]);
} catch (Throwable $error) {
	error_log($error->getMessage());
	attendanceResponse(['error' => 'Attendance service unavailable.'], 500);
}
