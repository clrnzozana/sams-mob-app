<?php

/**
 * Background script to send OTP emails without blocking the login response.
 * Called via proc_open from login.php with non-blocking execution.
 *
 * Usage: php send-otp-email.php <recipient> <subject> <body> <debug_mode>
 */

declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
    exit('This script can only be run from the command line.');
}

require_once __DIR__ . '/mailer.php';

// Parse command-line arguments
$recipient = $argv[1] ?? '';
$subject = $argv[2] ?? '';
$body = $argv[3] ?? '';
$debugMode = ($argv[4] ?? '0') === '1';

if (!$recipient || !$subject || !$body) {
    error_log('OTP email script: missing required arguments');
    exit(1);
}

// Set a short timeout for the background job (10 seconds max)
set_time_limit(10);

try {
    $sent = mobileSendMail($recipient, $subject, $body);
    if ($sent) {
        error_log("OTP email successfully sent to {$recipient}");
        exit(0);
    } else {
        error_log("OTP email failed to send to {$recipient}");
        exit(1);
    }
} catch (Throwable $error) {
    error_log('OTP email script error: ' . $error->getMessage());
    exit(1);
}
