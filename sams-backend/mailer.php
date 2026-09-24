<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/vendor/autoload.php';

function mobileSendMail(string $recipient, string $subject, string $body, ?string $htmlBody = null): bool
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

        if ($htmlBody !== null) {
            $mailer->isHTML(true);
            $mailer->Body = $htmlBody;
            $mailer->AltBody = $body;
        } else {
            $mailer->isHTML(false);
            $mailer->Body = $body;
        }

        $success = $mailer->send();
        if ($success) {
            error_log("[sams] Successfully dispatched email to {$recipient} with subject '{$subject}'");
        }
        return $success;
    } catch (Throwable $error) {
        error_log('[sams] SMTP delivery failed to ' . $recipient . ': ' . $error->getMessage());
        return false;
    }
}

function mobileSendOtpEmail(string $recipient, string $otpCode): bool
{
    $subject = "NU SAMS - Verification Code: {$otpCode}";
    $plainBody = "Your NU SAMS verification code is {$otpCode}. It expires in 10 minutes.\n\nIf you did not request this code, please ignore this email.";

    $htmlBody = <<<HTML
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f6fb; margin: 0; padding: 24px; }
    .card { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .header { text-align: center; margin-bottom: 24px; }
    .header h2 { color: #061D5A; margin: 0 0 6px 0; font-size: 24px; }
    .header p { color: #556987; margin: 0; font-size: 14px; }
    .code-box { background: #f0f4fc; border: 2px dashed #061D5A; border-radius: 8px; text-align: center; padding: 18px; margin: 24px 0; }
    .code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #061D5A; font-family: monospace; }
    .footer { text-align: center; color: #8896ab; font-size: 12px; margin-top: 24px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h2>NU SAMS</h2>
      <p>Student Assistants Management System</p>
    </div>
    <p style="color: #2d3748; font-size: 15px; line-height: 1.5;">
      Hello,<br><br>
      You are logging in to the NU SAMS mobile application. Use the following 6-digit verification code to complete your login:
    </p>
    <div class="code-box">
      <div class="code">{$otpCode}</div>
    </div>
    <p style="color: #4a5568; font-size: 13px; text-align: center;">
      This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
    </p>
    <div class="footer">
      If you did not request this login attempt, please check your account security or contact your administrator immediately.
    </div>
  </div>
</body>
</html>
HTML;

    return mobileSendMail($recipient, $subject, $plainBody, $htmlBody);
}
