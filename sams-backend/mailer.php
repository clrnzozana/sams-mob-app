<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/vendor/autoload.php';

function mobileSendMail(string $recipient, string $subject, string $body): bool
{
    try {
        $mailer = new PHPMailer(true);
        $username = getenv('SAMS_SMTP_USER') ?: '';
        if ($username === '') {
            error_log('[sams] SMTP username missing — falling back to PHP mail()');
            $mailer->isMail();
        } else {
            $mailer->isSMTP();
            $mailer->Host = getenv('SAMS_SMTP_HOST') ?: 'smtp.gmail.com';
            $mailer->Port = (int) (getenv('SAMS_SMTP_PORT') ?: 587);
            $mailer->SMTPAuth = true;
            $mailer->Username = $username;
            $mailer->Password = getenv('SAMS_SMTP_PASSWORD') ?: '';
            $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }
        $mailer->CharSet = 'UTF-8';
        $fromEmail = getenv('SAMS_SMTP_FROM');
        if (empty($fromEmail)) {
            $fromEmail = !empty($username) ? $username : 'noreply@localhost';
        }

        $mailer->setFrom(
            $fromEmail,
            getenv('SAMS_SMTP_FROM_NAME') ?: 'NU SAMS'
        );
        $mailer->addAddress($recipient);
        $mailer->Subject = $subject;
        $mailer->Body = $body;

        return $mailer->send();
    } catch (Throwable $error) {
        error_log('SMTP delivery failed: ' . $error->getMessage());
        return false;
    }
}
