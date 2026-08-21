<?php

declare(strict_types=1);

require_once __DIR__ . '/auth.php';
require_once __DIR__ . '/database.php';

header('Content-Type: application/json; charset=utf-8');

function dashboardResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
	dashboardResponse(['error' => 'Method not allowed.'], 405);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		dashboardResponse(['error' => 'Authentication required.'], 401);
	}

	if ($user['role'] !== 'student') {
		dashboardResponse(['error' => 'Student access required.'], 403);
	}

	$assignmentStatement = $database->prepare(
		'SELECT s.student_id, s.student_id_number, s.program, s.year_level,
				a.application_id, a.status AS application_status,
				a.preferred_office, a.available_hours_per_week,
				h.total_hours_scheduled, h.total_hours_worked,
				h.total_hours_absent, h.late_instances, h.total_late_minutes,
				t.term_id, t.term_name, t.term_year
		 FROM students s
		 LEFT JOIN applications a ON a.student_id = s.student_id
			 AND a.status = :approved_status
		 LEFT JOIN terms t ON t.term_id = a.term_id
			 AND t.is_active = 1
		 LEFT JOIN student_hours_summary h ON h.application_id = a.application_id
			 AND h.term_id = a.term_id
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
		dashboardResponse(['error' => 'No active student assignment found.'], 404);
	}

	$applicationId = (int) $assignment['application_id'];
	$termId = (int) $assignment['term_id'];

	$dutyCounts = $database->prepare(
		'SELECT
			COUNT(*) AS total_duties,
			SUM(status IN (\'accepted\', \'deployed\')) AS accepted_duties,
			SUM(status = \'assigned\') AS pending_responses
		 FROM duty_schedules
		 WHERE application_id = :application_id
		   AND term_id = :term_id'
	);
	$dutyCounts->execute([
		':application_id' => $applicationId,
		':term_id' => $termId,
	]);
	$counts = $dutyCounts->fetch() ?: [];

	$attendanceStatement = $database->prepare(
		'SELECT
			COUNT(*) AS total_records,
			SUM(status = \'present\') AS present,
			SUM(status = \'late\') AS late,
			SUM(status = \'absent\') AS absent,
			SUM(status = \'incomplete\') AS incomplete
		 FROM attendance_logs
		 WHERE application_id = :application_id
		   AND term_id = :term_id'
	);
	$attendanceStatement->execute([
		':application_id' => $applicationId,
		':term_id' => $termId,
	]);
	$attendance = $attendanceStatement->fetch() ?: [];
	$attendanceTotal = (int) ($attendance['total_records'] ?? 0);
	$attendancePresent = (int) ($attendance['present'] ?? 0);
	$attendanceLate = (int) ($attendance['late'] ?? 0);
	$attendanceRate = $attendanceTotal > 0
		? round((($attendancePresent + $attendanceLate) / $attendanceTotal) * 100, 1)
		: 0;

	$weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	$todayIndex = (int) (new DateTimeImmutable('now'))->format('N') - 1;
	$nextDutyOrder = array_merge(
		array_slice($weekdayOrder, $todayIndex),
		array_slice($weekdayOrder, 0, $todayIndex)
	);
	$nextDutyStatement = $database->prepare(
		'SELECT day_of_week, start_time, end_time, office_name, status
		 FROM duty_schedules
				 WHERE application_id = ?
					 AND term_id = ?
		   AND status IN (\'assigned\', \'accepted\', \'deployed\')
		 ORDER BY FIELD(day_of_week, ' . implode(',', array_fill(0, count($nextDutyOrder), '?')) . '), start_time
		 LIMIT 1'
	);
	$nextDutyStatement->execute(array_merge([$applicationId, $termId], $nextDutyOrder));
	$nextDuty = $nextDutyStatement->fetch() ?: null;

	$notificationStatement = $database->prepare(
		'SELECT COUNT(*)
		 FROM notifications
		 WHERE user_id = :user_id
		   AND is_read = 0'
	);
	$notificationStatement->execute([':user_id' => $user['user_id']]);

	dashboardResponse([
		'student' => [
			'user_id' => (int) $user['user_id'],
			'name' => trim($user['first_name'] . ' ' . $user['last_name']),
			'email' => $user['email'],
			'student_id' => $assignment['student_id_number'],
			'program' => $assignment['program'],
			'year_level' => $assignment['year_level'] === null ? null : (int) $assignment['year_level'],
		],
		'assignment' => [
			'office' => $assignment['preferred_office'],
			'status' => $assignment['application_status'],
			'term' => $assignment['term_name'] . ' ' . $assignment['term_year'],
			'hours_per_week' => (int) ($assignment['available_hours_per_week'] ?? 0),
		],
		'hours' => [
			'scheduled' => (float) ($assignment['total_hours_scheduled'] ?? 0),
			'worked' => (float) ($assignment['total_hours_worked'] ?? 0),
			'absent' => (float) ($assignment['total_hours_absent'] ?? 0),
			'late_instances' => (int) ($assignment['late_instances'] ?? 0),
			'late_minutes' => (int) ($assignment['total_late_minutes'] ?? 0),
		],
		'duties' => [
			'total' => (int) ($counts['total_duties'] ?? 0),
			'accepted' => (int) ($counts['accepted_duties'] ?? 0),
			'pending_responses' => (int) ($counts['pending_responses'] ?? 0),
		],
		'attendance' => [
			'rate' => $attendanceRate,
			'present' => $attendancePresent,
			'late' => $attendanceLate,
			'absent' => (int) ($attendance['absent'] ?? 0),
			'incomplete' => (int) ($attendance['incomplete'] ?? 0),
		],
		'unread_notifications' => (int) $notificationStatement->fetchColumn(),
		'next_duty' => $nextDuty,
	]);
} catch (Throwable $error) {
	error_log($error->getMessage());
	dashboardResponse(['error' => 'Dashboard service unavailable.'], 500);
}
