<?php

declare(strict_types=1);

require_once __DIR__ . '/../../auth.php';
require_once __DIR__ . '/../../database.php';
require_once __DIR__ . '/../../cors.php';

header('Content-Type: application/json; charset=utf-8');

function adminReviewResponse(array $payload, int $statusCode = 200): never
{
	http_response_code($statusCode);
	echo json_encode($payload, JSON_THROW_ON_ERROR);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	adminReviewResponse(['error' => 'Method not allowed.'], 405);
}

$request = json_decode(file_get_contents('php://input'), true);

if (!is_array($request)) {
	adminReviewResponse(['error' => 'Request body must be valid JSON.'], 400);
}

$noteId = filter_var($request['note_id'] ?? null, FILTER_VALIDATE_INT);
$action = trim((string) ($request['action'] ?? '')); // 'excuse', 'remove', 'decline'
$adminReply = trim((string) ($request['admin_reply'] ?? ''));

if ($noteId === false || $noteId === null || !in_array($action, ['excuse', 'remove', 'decline'], true)) {
	adminReviewResponse([
		'error' => 'note_id and action ("excuse", "remove", or "decline") are required.',
	], 422);
}

try {
	$database = mobileDatabase();
	$user = mobileAuthenticate($database);

	if ($user === null) {
		adminReviewResponse(['error' => 'Authentication required.'], 401);
	}

	if ($user['role'] !== 'admin') {
		adminReviewResponse(['error' => 'Administrator access required.'], 403);
	}

	// Fetch note details
	$noteStmt = $database->prepare(
		'SELECT n.note_id, n.duty_id, n.application_id, n.schedule_date, n.reason, n.status,
				d.office_name, d.day_of_week, d.start_time, d.end_time, d.term_id,
				s.user_id AS student_user_id, u.first_name, u.last_name
		 FROM duty_schedule_notes n
		 INNER JOIN duty_schedules d ON d.duty_id = n.duty_id
		 INNER JOIN applications a ON a.application_id = n.application_id
		 INNER JOIN students s ON s.student_id = a.student_id
		 INNER JOIN users u ON u.user_id = s.user_id
		 WHERE n.note_id = :note_id'
	);
	$noteStmt->execute([':note_id' => $noteId]);
	$note = $noteStmt->fetch(PDO::FETCH_ASSOC);

	if ($note === false) {
		adminReviewResponse(['error' => 'Schedule note not found.'], 404);
	}

	$targetStatus = match ($action) {
		'excuse' => 'excused',
		'remove' => 'removed',
		'decline' => 'declined',
	};

	// Update note
	$updateNote = $database->prepare(
		'UPDATE duty_schedule_notes
		 SET status = :status,
			 admin_reply = :admin_reply,
			 updated_at = CURRENT_TIMESTAMP
		 WHERE note_id = :note_id'
	);
	$updateNote->execute([
		':status' => $targetStatus,
		':admin_reply' => $adminReply !== '' ? $adminReply : null,
		':note_id' => $noteId,
	]);

	$dutyDate = $note['schedule_date'];
	$startTime = $note['start_time'];
	$clockInTime = "{$dutyDate} {$startTime}";

	if ($action === 'excuse') {
		// Insert or update attendance_logs to 'excused'
		$checkLog = $database->prepare(
			'SELECT log_id FROM attendance_logs
			 WHERE application_id = :application_id
			   AND duty_id = :duty_id
			   AND DATE(clock_in_time) = :duty_date'
		);
		$checkLog->execute([
			':application_id' => $note['application_id'],
			':duty_id' => $note['duty_id'],
			':duty_date' => $dutyDate,
		]);
		$existingLog = $checkLog->fetch(PDO::FETCH_ASSOC);

		if ($existingLog !== false) {
			$updateLog = $database->prepare(
				'UPDATE attendance_logs
				 SET status = "excused",
					 notes = :notes
				 WHERE log_id = :log_id'
			);
			$updateLog->execute([
				':notes' => 'Excused by Admin: ' . $note['reason'],
				':log_id' => $existingLog['log_id'],
			]);
		} else {
			$insertLog = $database->prepare(
				'INSERT INTO attendance_logs (
					application_id,
					term_id,
					duty_id,
					clock_in_time,
					clock_out_time,
					status,
					late_minutes,
					notes
				) VALUES (
					:application_id,
					:term_id,
					:duty_id,
					:clock_in_time,
					NULL,
					"excused",
					0,
					:notes
				)'
			);
			$insertLog->execute([
				':application_id' => $note['application_id'],
				':term_id' => $note['term_id'],
				':duty_id' => $note['duty_id'],
				':clock_in_time' => $clockInTime,
				':notes' => 'Excused by Admin: ' . $note['reason'],
			]);
		}

		// Notify student
		$notifyStudent = $database->prepare(
			'INSERT INTO notifications (user_id, title, message, notification_type, is_read)
			 VALUES (:user_id, :title, :message, "schedule", 0)'
		);
		$notifyStudent->execute([
			':user_id' => $note['student_user_id'],
			':title' => 'Duty Excuse Approved',
			':message' => "Your excuse note for {$note['day_of_week']}, {$dutyDate} ({$note['office_name']}) has been approved by the administrator and marked as Excused.",
		]);
	} elseif ($action === 'remove') {
		// Notify student that schedule was removed for that week
		$notifyStudent = $database->prepare(
			'INSERT INTO notifications (user_id, title, message, notification_type, is_read)
			 VALUES (:user_id, :title, :message, "schedule", 0)'
		);
		$notifyStudent->execute([
			':user_id' => $note['student_user_id'],
			':title' => 'Duty Schedule Removed for This Week',
			':message' => "Your duty schedule for {$note['day_of_week']}, {$dutyDate} ({$note['office_name']}) has been removed for this week due to your approved excuse.",
		]);
	} elseif ($action === 'decline') {
		// Notify student that excuse was declined
		$notifyStudent = $database->prepare(
			'INSERT INTO notifications (user_id, title, message, notification_type, is_read)
			 VALUES (:user_id, :title, :message, "schedule", 0)'
		);
		$notifyStudent->execute([
			':user_id' => $note['student_user_id'],
			':title' => 'Duty Excuse Declined',
			':message' => "Your excuse note for {$note['day_of_week']}, {$dutyDate} was declined by the administrator. Duty performance is expected, or missed shift will be considered Absent.",
		]);
	}

	adminReviewResponse([
		'success' => true,
		'action' => $action,
		'status' => $targetStatus,
		'message' => "Schedule note #{$noteId} has been successfully {$targetStatus}.",
	]);
} catch (Throwable $error) {
	error_log($error->getMessage());
	adminReviewResponse(['error' => 'Admin review service unavailable.'], 500);
}
