<?php

declare(strict_types=1);

require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');

function profileResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
	profileResponse(['error' => 'Method not allowed.'], 405);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		profileResponse(['error' => 'Authentication required.'], 401);
	}

	if ($user['role'] !== 'student') {
		profileResponse(['error' => 'Student access required.'], 403);
	}

	$profileStatement = $database->prepare(
		'SELECT s.student_id, s.student_id_number, s.program, s.year_level,
				s.created_at AS student_created_at,
			a.application_id, a.status AS application_status,
				a.preferred_office, a.skills, a.available_hours_per_week,
			h.total_hours_scheduled, h.total_hours_worked,
			 COUNT(DISTINCT d.duty_id) AS total_duties,
			 COUNT(DISTINCT CASE WHEN d.status IN (\'accepted\', \'deployed\') THEN d.duty_id END) AS accepted_duties,
			 COUNT(DISTINCT CASE WHEN d.status = \'declined\' THEN d.duty_id END) AS declined_duties,
			 t.term_id, t.term_name, t.term_year
		 FROM students s
		 INNER JOIN applications a ON a.student_id = s.student_id
			 AND a.status = :approved_status
		 INNER JOIN terms t ON t.term_id = a.term_id
			 AND t.is_active = 1
		 LEFT JOIN student_hours_summary h ON h.application_id = a.application_id
			 AND h.term_id = a.term_id
		 LEFT JOIN duty_schedules d ON d.application_id = a.application_id
			 AND d.term_id = a.term_id
		 WHERE s.user_id = :user_id
		   AND s.is_enrolled = 1
		 GROUP BY s.student_id, a.application_id, h.summary_id, t.term_id
		 ORDER BY a.updated_at DESC
		 LIMIT 1'
	);
	$profileStatement->execute([
		':approved_status' => 'approved',
		':user_id' => $user['user_id'],
	]);
	$profile = $profileStatement->fetch();

	if ($profile === false) {
		profileResponse(['error' => 'No active student assignment found.'], 404);
	}

	$skills = $profile['skills'] === null || trim($profile['skills']) === ''
		? []
		: array_values(array_filter(array_map('trim', explode(',', $profile['skills']))));

	profileResponse([
		'user' => [
			'user_id' => (int) $user['user_id'],
			'first_name' => $user['first_name'],
			'last_name' => $user['last_name'],
			'name' => trim($user['first_name'] . ' ' . $user['last_name']),
			'email' => $user['email'],
			'phone_number' => $user['phone_number'] ?? null,
			'must_change_password' => (bool) $user['must_change_password'],
		],
		'student' => [
			'student_id' => $profile['student_id_number'],
			'program' => $profile['program'],
			'year_level' => $profile['year_level'] === null ? null : (int) $profile['year_level'],
			'date_joined' => $profile['student_created_at'],
		],
		'assignment' => [
			'application_id' => (int) $profile['application_id'],
			'term_id' => (int) $profile['term_id'],
			'term' => $profile['term_name'] . ' ' . $profile['term_year'],
			'office' => $profile['preferred_office'],
			'status' => $profile['application_status'],
			'hours_per_week' => (int) ($profile['available_hours_per_week'] ?? 0),
			'skills' => $skills,
		],
		'summary' => [
			'total_duty_hours' => (float) ($profile['total_hours_worked'] ?? 0),
			'total_hours_scheduled' => (float) ($profile['total_hours_scheduled'] ?? 0),
			'total_duties' => (int) ($profile['total_duties'] ?? 0),
			'accepted_duties' => (int) ($profile['accepted_duties'] ?? 0),
			'declined_duties' => (int) ($profile['declined_duties'] ?? 0),
		],
	]);
} catch (Throwable $error) {
	error_log($error->getMessage());
	profileResponse(['error' => 'Profile service unavailable.'], 500);
}