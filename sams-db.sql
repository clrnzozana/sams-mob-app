-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 14, 2026 at 04:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sams_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`admin_id`, `user_id`, `department`, `created_at`) VALUES
(1, 1, 'Administration', '2026-05-10 15:31:49');

-- --------------------------------------------------------

--
-- Table structure for table `admin_meetings`
--

CREATE TABLE `admin_meetings` (
  `meeting_id` int(10) UNSIGNED NOT NULL,
  `admin_user_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(160) NOT NULL,
  `meeting_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `category` varchar(40) NOT NULL DEFAULT 'admin_personal',
  `notes` text DEFAULT NULL,
  `reminder_minutes` int(11) NOT NULL DEFAULT 30,
  `status` varchar(20) NOT NULL DEFAULT 'scheduled',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_meetings`
--

INSERT INTO `admin_meetings` (`meeting_id`, `admin_user_id`, `title`, `meeting_date`, `start_time`, `end_time`, `location`, `category`, `notes`, `reminder_minutes`, `status`, `created_at`, `updated_at`) VALUES
(3, 999999, 'Baseline Meeting', '2026-05-16', '10:00:00', '11:00:00', NULL, 'admin_personal', NULL, 30, 'scheduled', '2026-05-15 01:41:44', '2026-05-15 01:41:44'),
(6, 1, 'Nu lipa meeting', '2026-06-16', '13:00:00', '14:00:00', 'Gym', 'admin_personal', 'Have to be there', 15, 'completed', '2026-05-16 12:10:42', '2026-05-17 02:19:02'),
(7, 1, 'S.A Meetings', '2023-06-04', '09:00:00', '11:30:00', 'Gym', 'sa_related', 'Announcement for All S.A', 30, 'scheduled', '2026-06-04 19:26:49', '2026-06-04 19:26:49'),
(8, 1, 'S.A Meetings', '2023-06-04', '09:00:00', '11:30:00', 'Gym', 'sa_related', 'Announcement for All S.A', 30, 'scheduled', '2026-06-04 19:26:56', '2026-06-04 19:26:56'),
(10, 1, 'Business Meeting', '2026-06-04', '09:00:00', '13:00:00', 'Starbucks', 'external', 'Business Meeting with Mr Ford for Food business in mandaluyong', 30, 'scheduled', '2026-06-04 19:38:54', '2026-06-04 19:38:54'),
(13, 1, 'Test', '2026-06-07', '16:00:00', '20:00:00', 'Test', 'external', 'Test', 30, 'completed', '2026-06-04 19:43:07', '2026-06-05 16:58:41'),
(14, 1, 'Test1', '2000-06-05', '07:00:00', '08:00:00', 'test1', 'admin_personal', 'Test1', 30, 'scheduled', '2026-06-05 16:45:43', '2026-06-05 16:45:43'),
(15, 1, 'Test1', '2000-06-05', '07:00:00', '08:00:00', 'test1', 'admin_personal', 'Test1', 30, 'scheduled', '2026-06-05 16:45:49', '2026-06-05 16:45:49'),
(16, 1, 'Test1', '2000-06-05', '18:00:00', '19:00:00', 'Test1', 'admin_personal', 'test1', 30, 'scheduled', '2026-06-05 16:46:38', '2026-06-05 16:46:38'),
(17, 1, 'Test1', '2000-06-05', '18:00:00', '19:00:00', 'Test1', 'admin_personal', 'test1', 30, 'scheduled', '2026-06-05 16:46:41', '2026-06-05 16:46:41'),
(20, 1, 'Test3', '2026-06-05', '17:00:00', '19:30:00', 'Test3', 'admin_personal', 'Test3', 30, 'scheduled', '2026-06-05 16:49:56', '2026-06-05 16:49:56'),
(21, 1, 'Test1', '2026-06-04', '07:00:00', '08:00:00', 'Test1', 'office_meeting', 'Test1', 30, 'completed', '2026-06-05 16:51:01', '2026-06-20 18:55:28');

-- --------------------------------------------------------

--
-- Table structure for table `admin_meeting_notifications`
--

CREATE TABLE `admin_meeting_notifications` (
  `notification_id` int(10) UNSIGNED NOT NULL,
  `meeting_id` int(10) UNSIGNED NOT NULL,
  `admin_user_id` int(10) UNSIGNED NOT NULL,
  `notify_type` varchar(20) NOT NULL,
  `scheduled_notify_at` datetime NOT NULL,
  `message` varchar(255) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_meeting_notifications`
--

INSERT INTO `admin_meeting_notifications` (`notification_id`, `meeting_id`, `admin_user_id`, `notify_type`, `scheduled_notify_at`, `message`, `is_read`, `read_at`, `created_at`) VALUES
(3934, 6, 1, 'scheduled', '2026-05-16 17:19:48', 'Meeting scheduled: Nu lipa meeting on Jun 16, 2026 at 1:00 PM', 1, '2026-05-17 02:19:00', '2026-05-16 17:19:48'),
(5020, 10, 1, 'upcoming', '2026-06-04 08:30:00', 'Upcoming meeting: Business Meeting (30 minutes before) on Jun 04, 2026 at 9:00 AM', 1, '2026-06-20 18:54:41', '2026-06-04 19:38:54'),
(5021, 10, 1, 'start', '2026-06-04 09:00:00', 'You have a meeting now: Business Meeting (external) on Jun 04, 2026 at 9:00 AM', 1, '2026-06-04 19:45:42', '2026-06-04 19:38:54'),
(5144, 13, 1, 'scheduled', '2026-06-04 19:43:07', 'Meeting scheduled: Test on Jun 07, 2026 at 4:00 PM', 1, '2026-06-04 19:45:31', '2026-06-04 19:43:07'),
(6618, 20, 1, 'scheduled', '2026-06-05 16:49:56', 'Meeting scheduled: Test3 on Jun 05, 2026 at 5:00 PM', 1, '2026-06-20 18:53:46', '2026-06-05 16:49:56'),
(6619, 20, 1, 'upcoming', '2026-06-05 16:30:00', 'Upcoming meeting: Test3 (30 minutes before) on Jun 05, 2026 at 5:00 PM', 1, '2026-06-05 17:46:04', '2026-06-05 16:49:56'),
(6702, 21, 1, 'upcoming', '2026-06-04 06:30:00', 'Upcoming meeting: Test1 (30 minutes before) on Jun 04, 2026 at 7:00 AM', 1, '2026-06-20 18:55:25', '2026-06-05 16:51:01'),
(6703, 21, 1, 'start', '2026-06-04 07:00:00', 'You have a meeting now: Test1 (office meeting) on Jun 04, 2026 at 7:00 AM', 1, '2026-06-20 18:54:35', '2026-06-05 16:51:01'),
(7041, 22, 1, 'scheduled', '2026-06-05 16:55:16', 'Meeting scheduled: Test Meeting on 2026-06-10 on Jun 10, 2026 at 10:00 AM', 0, NULL, '2026-06-05 16:55:16'),
(7517, 20, 1, 'start', '2026-06-05 17:00:00', 'You have a meeting now: Test3 (admin personal) on Jun 05, 2026 at 5:00 PM', 1, '2026-06-05 17:45:56', '2026-06-05 17:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` longtext NOT NULL,
  `audience` enum('students','supervisors','all') NOT NULL DEFAULT 'students',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `body`, `audience`, `is_active`, `created_by`, `created_at`) VALUES
(1, 'Test Announcement', 'This is a test announcement for students to verify the real-time notification system is working correctly.', 'students', 1, 1, '2026-05-11 17:16:54'),
(2, 'Rescheduling To all students', 'I understand your frustration but we have to reshuffle', 'students', 1, 1, '2026-05-11 18:24:45'),
(3, 'Thank you lord', '<3', 'students', 1, 1, '2026-05-12 03:50:30'),
(4, 'Student Evaluation May 15 to 23', 'we must receive Student evaluations', 'supervisors', 1, 1, '2026-05-15 12:25:58'),
(5, 'For all supervisor Meeting at 5/20/2026', 'qwe', 'supervisors', 1, 1, '2026-05-16 18:30:13'),
(6, 'Test1', 'test1', 'all', 1, 1, '2026-06-20 19:01:27');

-- --------------------------------------------------------

--
-- Table structure for table `announcement_reads`
--

CREATE TABLE `announcement_reads` (
  `id` int(10) UNSIGNED NOT NULL,
  `announcement_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `read_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcement_reads`
--

INSERT INTO `announcement_reads` (`id`, `announcement_id`, `user_id`, `read_at`) VALUES
(1, 1, 3, '2026-05-11 17:53:49'),
(3, 2, 3, '2026-05-11 18:25:27'),
(8, 3, 14, '2026-05-12 03:51:05'),
(9, 2, 14, '2026-05-12 03:51:07'),
(10, 1, 14, '2026-05-12 03:51:07'),
(11, 3, 21, '2026-05-17 14:50:54'),
(12, 2, 21, '2026-05-17 14:50:56'),
(13, 1, 21, '2026-05-17 14:50:57'),
(14, 3, 25, '2026-05-19 07:40:02'),
(15, 1, 25, '2026-05-19 07:40:04'),
(16, 2, 25, '2026-05-19 07:40:04'),
(17, 4, 2, '2026-06-20 19:05:21'),
(18, 5, 2, '2026-06-20 19:05:21'),
(19, 6, 2, '2026-06-20 19:05:21'),
(20, 1, 36, '2026-06-20 19:08:32'),
(21, 2, 36, '2026-06-20 19:08:32'),
(22, 3, 36, '2026-06-20 19:08:32'),
(23, 6, 36, '2026-06-20 19:08:32');

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `application_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `status` enum('pending','approved','rejected','withdrawn','draft') DEFAULT 'draft',
  `preferred_office` varchar(100) DEFAULT NULL,
  `skills` text DEFAULT NULL,
  `available_hours_per_week` int(11) DEFAULT NULL,
  `minimum_hours_per_day` int(11) DEFAULT NULL,
  `minimum_hours_per_semester` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `applications`
--

INSERT INTO `applications` (`application_id`, `student_id`, `term_id`, `status`, `preferred_office`, `skills`, `available_hours_per_week`, `minimum_hours_per_day`, `minimum_hours_per_semester`, `submitted_at`, `reviewed_by`, `reviewed_at`, `supervisor_id`, `assigned_at`, `created_at`, `updated_at`) VALUES
(30, 31, 1, 'approved', 'ITSO', 'Teamwork, Problem Solving', 24, NULL, NULL, '2026-06-04 12:55:24', 1, '2026-06-04 12:56:03', NULL, NULL, '2026-06-04 12:55:24', '2026-06-04 12:56:03'),
(32, 33, 1, 'approved', 'ITSO', 'Time Management, Leadership, Organization', 38, NULL, NULL, '2026-06-05 08:40:43', 1, '2026-06-05 08:41:24', NULL, NULL, '2026-06-05 08:40:25', '2026-06-05 08:41:24');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_logs`
--

CREATE TABLE `attendance_logs` (
  `log_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `duty_id` int(11) DEFAULT NULL,
  `clock_in_time` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `clock_out_time` timestamp NULL DEFAULT NULL,
  `status` enum('present','absent','late','incomplete') DEFAULT 'present',
  `late_minutes` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `audit_id` int(11) NOT NULL,
  `attendance_log_id` int(11) DEFAULT NULL,
  `application_id` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `status_before` varchar(50) DEFAULT NULL,
  `status_after` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `availability`
--

CREATE TABLE `availability` (
  `availability_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `availability`
--

INSERT INTO `availability` (`availability_id`, `application_id`, `term_id`, `day_of_week`, `start_time`, `end_time`, `created_at`, `updated_at`, `notes`) VALUES
(171, 30, 1, 'Monday', '08:00:00', '12:00:00', '2026-06-04 12:55:38', '2026-06-04 12:55:38', NULL),
(172, 30, 1, 'Tuesday', '08:00:00', '12:00:00', '2026-06-04 12:55:38', '2026-06-04 12:55:38', NULL),
(173, 30, 1, 'Wednesday', '08:00:00', '12:00:00', '2026-06-04 12:55:38', '2026-06-04 12:55:38', NULL),
(174, 30, 1, 'Thursday', '08:00:00', '12:00:00', '2026-06-04 12:55:38', '2026-06-04 12:55:38', NULL),
(175, 30, 1, 'Friday', '08:00:00', '12:00:00', '2026-06-04 12:55:38', '2026-06-04 12:55:38', NULL),
(176, 30, 1, 'Saturday', '08:00:00', '12:00:00', '2026-06-04 12:55:38', '2026-06-04 12:55:38', NULL),
(177, 32, 1, 'Monday', '08:00:00', '12:00:00', '2026-06-05 08:40:43', '2026-06-05 08:40:43', NULL),
(178, 32, 1, 'Monday', '13:00:00', '20:00:00', '2026-06-05 08:40:43', '2026-06-05 08:40:43', NULL),
(179, 32, 1, 'Tuesday', '08:00:00', '12:00:00', '2026-06-05 08:40:43', '2026-06-05 08:40:43', NULL),
(180, 32, 1, 'Wednesday', '08:00:00', '12:00:00', '2026-06-05 08:40:43', '2026-06-05 08:40:43', NULL),
(181, 32, 1, 'Thursday', '08:00:00', '12:00:00', '2026-06-05 08:40:43', '2026-06-05 08:40:43', NULL),
(182, 32, 1, 'Friday', '08:00:00', '12:00:00', '2026-06-05 08:40:43', '2026-06-05 08:40:43', NULL),
(183, 32, 1, 'Friday', '13:00:00', '20:00:00', '2026-06-05 08:40:43', '2026-06-05 08:40:43', NULL),
(184, 32, 1, 'Saturday', '08:00:00', '12:00:00', '2026-06-05 08:40:43', '2026-06-05 08:40:43', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `document_uploads`
--

CREATE TABLE `document_uploads` (
  `upload_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `application_id` int(11) DEFAULT NULL,
  `document_type` varchar(50) DEFAULT NULL,
  `original_filename` varchar(255) NOT NULL,
  `stored_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `document_uploads`
--

INSERT INTO `document_uploads` (`upload_id`, `user_id`, `application_id`, `document_type`, `original_filename`, `stored_filename`, `file_path`, `file_size`, `mime_type`, `uploaded_at`) VALUES
(70, 34, 30, 'grade_slip', 'Screenshot 2026-05-12 180558.png', 'cog_6a2175b4406321.97908283.png', 'uploads/documents/student_31/application_30/cog_6a2175b4406321.97908283.png', 533514, 'image/png', '2026-06-04 12:55:24'),
(71, 34, 30, 'valid_id', 'Screenshot 2026-05-12 180403.png', 'valid_id_6a2175b4407b61.42721745.png', 'uploads/documents/student_31/application_30/valid_id_6a2175b4407b61.42721745.png', 447558, 'image/png', '2026-06-04 12:55:24'),
(72, 34, 30, 'other', 'Screenshot 2026-05-12 180403.png', 'photo_6a2175b4408ec7.77701591.png', 'uploads/documents/student_31/application_30/photo_6a2175b4408ec7.77701591.png', 447558, 'image/png', '2026-06-04 12:55:24'),
(76, 36, 32, 'grade_slip', 'Screenshot 2026-05-12 180558.png', 'cog_6a228b74270e02.71659327.png', 'uploads/documents/student_33/application_32/cog_6a228b74270e02.71659327.png', 533514, 'image/png', '2026-06-05 08:40:25'),
(77, 36, 32, 'valid_id', 'Screenshot 2026-05-12 180403.png', 'valid_id_6a228b74274e68.83555009.png', 'uploads/documents/student_33/application_32/valid_id_6a228b74274e68.83555009.png', 447558, 'image/png', '2026-06-05 08:40:25'),
(78, 36, 32, 'other', 'Screenshot 2026-05-12 180731.png', 'photo_6a228b742767b5.10100552.png', 'uploads/documents/student_33/application_32/photo_6a228b742767b5.10100552.png', 431238, 'image/png', '2026-06-05 08:40:25');

-- --------------------------------------------------------

--
-- Table structure for table `duty_schedules`
--

CREATE TABLE `duty_schedules` (
  `duty_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `office_name` varchar(100) DEFAULT NULL,
  `term_id` int(11) NOT NULL,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` enum('assigned','accepted','rejected','declined','deployed') DEFAULT 'assigned',
  `student_response_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `duty_schedules`
--

INSERT INTO `duty_schedules` (`duty_id`, `application_id`, `office_name`, `term_id`, `day_of_week`, `start_time`, `end_time`, `status`, `student_response_date`, `created_at`, `updated_at`) VALUES
(218, 30, 'ITSO', 1, 'Monday', '08:00:00', '12:00:00', 'assigned', NULL, '2026-06-04 12:56:03', '2026-06-04 12:56:03'),
(219, 30, 'ITSO', 1, 'Tuesday', '08:00:00', '12:00:00', 'assigned', NULL, '2026-06-04 12:56:03', '2026-06-04 12:56:03'),
(220, 30, 'ITSO', 1, 'Wednesday', '08:00:00', '12:00:00', 'assigned', NULL, '2026-06-04 12:56:03', '2026-06-04 12:56:03'),
(221, 30, 'ITSO', 1, 'Thursday', '08:00:00', '12:00:00', 'assigned', NULL, '2026-06-04 12:56:03', '2026-06-04 12:56:03'),
(222, 30, 'ITSO', 1, 'Friday', '08:00:00', '12:00:00', 'assigned', NULL, '2026-06-04 12:56:03', '2026-06-04 12:56:03'),
(223, 30, 'ITSO', 1, 'Saturday', '08:00:00', '12:00:00', 'assigned', NULL, '2026-06-04 12:56:03', '2026-06-04 12:56:03'),
(224, 32, 'ITSO', 1, 'Monday', '08:00:00', '12:00:00', 'deployed', NULL, '2026-06-05 08:41:24', '2026-06-20 09:21:17'),
(225, 32, 'ITSO', 1, 'Monday', '13:00:00', '20:00:00', 'deployed', NULL, '2026-06-05 08:41:24', '2026-06-20 09:21:17'),
(226, 32, 'ITSO', 1, 'Tuesday', '08:00:00', '12:00:00', 'deployed', NULL, '2026-06-05 08:41:24', '2026-06-20 09:21:17'),
(227, 32, 'ITSO', 1, 'Wednesday', '08:00:00', '12:00:00', 'deployed', NULL, '2026-06-05 08:41:24', '2026-06-20 09:21:17'),
(228, 32, 'ITSO', 1, 'Thursday', '08:00:00', '12:00:00', 'deployed', NULL, '2026-06-05 08:41:24', '2026-06-20 09:21:17'),
(229, 32, 'ITSO', 1, 'Friday', '08:00:00', '12:00:00', 'deployed', NULL, '2026-06-05 08:41:24', '2026-06-20 09:21:17'),
(230, 32, 'ITSO', 1, 'Friday', '13:00:00', '20:00:00', 'deployed', NULL, '2026-06-05 08:41:24', '2026-06-20 09:21:17'),
(231, 32, 'ITSO', 1, 'Saturday', '08:00:00', '12:00:00', 'deployed', NULL, '2026-06-05 08:41:24', '2026-06-20 09:21:17');

-- --------------------------------------------------------

--
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `evaluation_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `supervisor_id` int(11) NOT NULL,
  `performance_rating` int(11) DEFAULT NULL,
  `reliability_rating` int(11) DEFAULT NULL,
  `professionalism_rating` int(11) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `notification_type` enum('schedule','evaluation','attendance','system') DEFAULT 'system',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mobile_otp_challenges`
--

CREATE TABLE `mobile_otp_challenges` (
  `challenge_id` char(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `code_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `mobile_auth_sessions`
--

CREATE TABLE `mobile_auth_sessions` (
  `session_id` bigint(20) unsigned NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `shuffle_history`
--

CREATE TABLE `shuffle_history` (
  `shuffle_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `shuffled_by` int(11) DEFAULT NULL,
  `old_schedule_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_schedule_data`)),
  `new_schedule_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_schedule_data`)),
  `reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sse_tokens`
--

CREATE TABLE `sse_tokens` (
  `token` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `office_name` varchar(128) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `student_id_number` varchar(20) NOT NULL,
  `program` varchar(100) NOT NULL,
  `year_level` int(11) DEFAULT NULL,
  `current_gpa` decimal(4,2) DEFAULT NULL,
  `is_enrolled` tinyint(1) DEFAULT 1,
  `is_good_standing` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `nfc_uid` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `user_id`, `student_id_number`, `program`, `year_level`, `current_gpa`, `is_enrolled`, `is_good_standing`, `created_at`, `updated_at`, `nfc_uid`) VALUES
(31, 34, '2021-2', 'BSIT', 3, 3.00, 1, 1, '2026-06-04 12:55:24', '2026-06-20 10:44:54', '1272586754'),
(33, 36, '2021-1', 'BSIT', 4, 3.50, 1, 1, '2026-06-05 08:40:25', '2026-06-20 10:45:44', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_hours_summary`
--

CREATE TABLE `student_hours_summary` (
  `summary_id` int(11) NOT NULL,
  `application_id` int(11) NOT NULL,
  `term_id` int(11) NOT NULL,
  `total_hours_scheduled` int(11) DEFAULT 0,
  `total_hours_worked` int(11) DEFAULT 0,
  `total_hours_absent` int(11) DEFAULT 0,
  `late_instances` int(11) DEFAULT 0,
  `total_late_minutes` int(11) DEFAULT 0,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_reports`
--

CREATE TABLE `student_reports` (
  `report_id` int(11) NOT NULL,
  `application_id` int(11) DEFAULT NULL,
  `duty_id` int(11) DEFAULT NULL,
  `student_code` varchar(128) DEFAULT NULL,
  `reporter_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(32) NOT NULL DEFAULT 'open',
  `is_new` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `supervisors`
--

CREATE TABLE `supervisors` (
  `supervisor_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `office_name` varchar(100) NOT NULL,
  `max_students` int(11) DEFAULT 5,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supervisors`
--

INSERT INTO `supervisors` (`supervisor_id`, `user_id`, `office_name`, `max_students`, `phone`, `created_at`, `updated_at`) VALUES
(1, 2, 'ITSO', 5, '555-0001', '2026-05-10 15:31:49', '2026-06-20 09:31:21'),
(2, 15, 'Library', 5, '090911', '2026-05-15 04:59:37', '2026-05-15 04:59:37');

-- --------------------------------------------------------

--
-- Table structure for table `system_flags`
--

CREATE TABLE `system_flags` (
  `flag_key` varchar(128) NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `system_flags`
--

INSERT INTO `system_flags` (`flag_key`, `enabled`, `created_at`) VALUES
('evaluations_enabled', 0, '2026-05-18 16:25:59');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_id`, `setting_key`, `setting_value`, `created_at`, `updated_at`) VALUES
(1, 'min_hours_per_day', '2', '2026-05-10 15:31:49', '2026-05-10 15:31:49'),
(2, 'min_hours_per_semester', '40', '2026-05-10 15:31:49', '2026-05-10 15:31:49'),
(3, 'max_late_minutes', '15', '2026-05-10 15:31:49', '2026-05-10 15:31:49'),
(4, 'attendance_grace_period_minutes', '5', '2026-05-10 15:31:49', '2026-05-10 15:31:49'),
(5, 'app_name', 'Student Assistants Management System', '2026-05-10 15:31:49', '2026-05-10 15:31:49'),
(6, 'app_version', '1.0.0', '2026-05-10 15:31:49', '2026-05-10 15:31:49'),
(7, 'evaluations_enabled', '0', '2026-05-18 16:22:43', '2026-05-18 16:22:43');

-- --------------------------------------------------------

--
-- Table structure for table `terms`
--

CREATE TABLE `terms` (
  `term_id` int(11) NOT NULL,
  `term_name` varchar(50) NOT NULL,
  `term_year` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `terms`
--

INSERT INTO `terms` (`term_id`, `term_name`, `term_year`, `start_date`, `end_date`, `is_active`, `created_at`) VALUES
(1, 'Spring', 2026, '2026-01-15', '2026-05-15', 1, '2026-05-10 15:31:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','supervisor','student') NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone_number` varchar(32) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `must_change_password` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `admin_meetings`
--
ALTER TABLE `admin_meetings`
  ADD PRIMARY KEY (`meeting_id`),
  ADD KEY `idx_admin_meetings_owner` (`admin_user_id`),
  ADD KEY `idx_admin_meetings_schedule` (`meeting_date`,`start_time`),
  ADD KEY `idx_admin_meetings_status` (`status`);

--
-- Indexes for table `admin_meeting_notifications`
--
ALTER TABLE `admin_meeting_notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD UNIQUE KEY `uniq_meeting_notify` (`meeting_id`,`notify_type`),
  ADD KEY `idx_admin_meeting_notifications_owner` (`admin_user_id`,`is_read`),
  ADD KEY `idx_admin_meeting_notifications_time` (`scheduled_notify_at`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ann_active_audience_created_at` (`is_active`,`audience`,`created_at`);

--
-- Indexes for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `ux_announcement_user` (`announcement_id`,`user_id`),
  ADD KEY `idx_ann_id` (`announcement_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`application_id`),
  ADD UNIQUE KEY `unique_app_per_term` (`student_id`,`term_id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `supervisor_id` (`supervisor_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_term` (`term_id`),
  ADD KEY `idx_app_office_term` (`preferred_office`,`term_id`);

--
-- Indexes for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `term_id` (`term_id`),
  ADD KEY `duty_id` (`duty_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_clock_in` (`clock_in_time`),
  ADD KEY `idx_al_app_duty_log` (`application_id`,`duty_id`,`log_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `attendance_log_id` (`attendance_log_id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `idx_date` (`created_at`);

--
-- Indexes for table `availability`
--
ALTER TABLE `availability`
  ADD PRIMARY KEY (`availability_id`),
  ADD KEY `term_id` (`term_id`),
  ADD KEY `idx_app_term` (`application_id`,`term_id`);

--
-- Indexes for table `document_uploads`
--
ALTER TABLE `document_uploads`
  ADD PRIMARY KEY (`upload_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_app` (`application_id`);

--
-- Indexes for table `duty_schedules`
--
ALTER TABLE `duty_schedules`
  ADD PRIMARY KEY (`duty_id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_term` (`term_id`),
  ADD KEY `idx_ds_term_day_status` (`term_id`,`day_of_week`,`status`);

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`evaluation_id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `supervisor_id` (`supervisor_id`),
  ADD KEY `idx_term` (`term_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user_read` (`user_id`,`is_read`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_token_hash` (`token_hash`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `mobile_otp_challenges`
--
ALTER TABLE `mobile_otp_challenges`
  ADD PRIMARY KEY (`challenge_id`),
  ADD KEY `idx_mobile_otp_user` (`user_id`),
  ADD KEY `idx_mobile_otp_expires` (`expires_at`);

--
-- Indexes for table `mobile_auth_sessions`
--
ALTER TABLE `mobile_auth_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD UNIQUE KEY `uq_mobile_auth_token_hash` (`token_hash`),
  ADD KEY `idx_mobile_auth_user` (`user_id`),
  ADD KEY `idx_mobile_auth_expires` (`expires_at`);

--
-- Indexes for table `shuffle_history`
--
ALTER TABLE `shuffle_history`
  ADD PRIMARY KEY (`shuffle_id`),
  ADD KEY `shuffled_by` (`shuffled_by`),
  ADD KEY `idx_term` (`term_id`);

--
-- Indexes for table `sse_tokens`
--
ALTER TABLE `sse_tokens`
  ADD PRIMARY KEY (`token`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `student_id_number` (`student_id_number`),
  ADD UNIQUE KEY `nfc_uid` (`nfc_uid`),
  ADD KEY `idx_program` (`program`),
  ADD KEY `idx_enrolled` (`is_enrolled`);

--
-- Indexes for table `student_hours_summary`
--
ALTER TABLE `student_hours_summary`
  ADD PRIMARY KEY (`summary_id`),
  ADD UNIQUE KEY `unique_summary` (`application_id`,`term_id`),
  ADD KEY `term_id` (`term_id`);

--
-- Indexes for table `student_reports`
--
ALTER TABLE `student_reports`
  ADD PRIMARY KEY (`report_id`);

--
-- Indexes for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD PRIMARY KEY (`supervisor_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_office` (`office_name`);

--
-- Indexes for table `system_flags`
--
ALTER TABLE `system_flags`
  ADD PRIMARY KEY (`flag_key`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `terms`
--
ALTER TABLE `terms`
  ADD PRIMARY KEY (`term_id`),
  ADD UNIQUE KEY `unique_term` (`term_name`,`term_year`),
  ADD KEY `idx_active` (`is_active`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `admin_meetings`
--
ALTER TABLE `admin_meetings`
  MODIFY `meeting_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `admin_meeting_notifications`
--
ALTER TABLE `admin_meeting_notifications`
  MODIFY `notification_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13460;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `application_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `audit_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `availability`
--
ALTER TABLE `availability`
  MODIFY `availability_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=185;

--
-- AUTO_INCREMENT for table `document_uploads`
--
ALTER TABLE `document_uploads`
  MODIFY `upload_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `duty_schedules`
--
ALTER TABLE `duty_schedules`
  MODIFY `duty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=236;

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `evaluation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `mobile_auth_sessions`
--
ALTER TABLE `mobile_auth_sessions`
  MODIFY `session_id` bigint(20) unsigned NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shuffle_history`
--
ALTER TABLE `shuffle_history`
  MODIFY `shuffle_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `student_hours_summary`
--
ALTER TABLE `student_hours_summary`
  MODIFY `summary_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_reports`
--
ALTER TABLE `student_reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `supervisors`
--
ALTER TABLE `supervisors`
  MODIFY `supervisor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `terms`
--
ALTER TABLE `terms`
  MODIFY `term_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `announcement_reads`
--
ALTER TABLE `announcement_reads`
  ADD CONSTRAINT `fk_ann_read_announcement` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `admins` (`admin_id`),
  ADD CONSTRAINT `applications_ibfk_4` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`supervisor_id`);

--
-- Constraints for table `attendance_logs`
--
ALTER TABLE `attendance_logs`
  ADD CONSTRAINT `attendance_logs_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_logs_ibfk_2` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attendance_logs_duty` FOREIGN KEY (`duty_id`) REFERENCES `duty_schedules` (`duty_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`attendance_log_id`) REFERENCES `attendance_logs` (`log_id`),
  ADD CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`),
  ADD CONSTRAINT `audit_logs_ibfk_3` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`admin_id`);

--
-- Constraints for table `availability`
--
ALTER TABLE `availability`
  ADD CONSTRAINT `availability_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `availability_ibfk_2` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE CASCADE;

--
-- Constraints for table `document_uploads`
--
ALTER TABLE `document_uploads`
  ADD CONSTRAINT `document_uploads_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_uploads_ibfk_2` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE CASCADE;

--
-- Constraints for table `duty_schedules`
--
ALTER TABLE `duty_schedules`
  ADD CONSTRAINT `duty_schedules_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `duty_schedules_ibfk_2` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE CASCADE;

--
-- Constraints for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `evaluations_ibfk_3` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`supervisor_id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `mobile_otp_challenges`
--
ALTER TABLE `mobile_otp_challenges`
  ADD CONSTRAINT `mobile_otp_challenges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `mobile_auth_sessions`
--
ALTER TABLE `mobile_auth_sessions`
  ADD CONSTRAINT `mobile_auth_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `shuffle_history`
--
ALTER TABLE `shuffle_history`
  ADD CONSTRAINT `shuffle_history_ibfk_1` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`),
  ADD CONSTRAINT `shuffle_history_ibfk_2` FOREIGN KEY (`shuffled_by`) REFERENCES `admins` (`admin_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
