<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/vendor/autoload.php';

function mobileSendMail(string $recipient, string $subject, string $body): bool
{
    try {
        $mailer = new PHPMailer(true);
        $mailer->isSMTP();
        $mailer->Host = getenv('SAMS_SMTP_HOST') ?: 'smtp.gmail.com';
        $mailer->Port = (int) (getenv('SAMS_SMTP_PORT') ?: 587);
        $mailer->SMTPAuth = true;
        $mailer->Username = getenv('SAMS_SMTP_USER') ?: '';
        $mailer->Password = getenv('SAMS_SMTP_PASSWORD') ?: '';
        $mailer->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mailer->CharSet = 'UTF-8';
        $mailer->setFrom(
            getenv('SAMS_SMTP_FROM') ?: $mailer->Username,
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
