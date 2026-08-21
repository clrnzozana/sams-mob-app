<?php

declare(strict_types=1);

const MOBILE_AUTH_SESSION_TTL_SECONDS = 604800;

function mobileCreateAuthSession(PDO $database, int $userId): string
{
    $token = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $token);
    $expiresAt = (new DateTimeImmutable('now', new DateTimeZone('UTC')))
        ->modify('+' . MOBILE_AUTH_SESSION_TTL_SECONDS . ' seconds')
        ->format('Y-m-d H:i:s');

    $statement = $database->prepare(
        'INSERT INTO mobile_auth_sessions (user_id, token_hash, expires_at)
         VALUES (:user_id, :token_hash, :expires_at)'
    );
    $statement->execute([
        ':user_id' => $userId,
        ':token_hash' => $tokenHash,
        ':expires_at' => $expiresAt,
    ]);

    return $token;
}

function mobileGetBearerToken(): ?string
{
    $authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if ($authorization === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        $authorization = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (!preg_match('/^Bearer\s+([a-f0-9]{64})$/i', trim($authorization), $matches)) {
        return null;
    }

    return $matches[1];
}

function mobileAuthenticate(PDO $database): ?array
{
    $token = mobileGetBearerToken();

    if ($token === null) {
        return null;
    }

    $statement = $database->prepare(
        'SELECT s.session_id, u.user_id, u.email, u.role, u.first_name, u.last_name,
                u.must_change_password
         FROM mobile_auth_sessions s
         INNER JOIN users u ON u.user_id = s.user_id
         WHERE s.token_hash = :token_hash
           AND s.revoked_at IS NULL
           AND s.expires_at > UTC_TIMESTAMP()
           AND u.is_active = 1
         LIMIT 1'
    );
    $statement->execute([
        ':token_hash' => hash('sha256', $token),
    ]);

    $user = $statement->fetch(PDO::FETCH_ASSOC);

    return $user === false ? null : $user;
}

function mobileRevokeAuthSession(PDO $database): bool
{
    $token = mobileGetBearerToken();

    if ($token === null) {
        return false;
    }

    $statement = $database->prepare(
        'UPDATE mobile_auth_sessions
         SET revoked_at = UTC_TIMESTAMP()
         WHERE token_hash = :token_hash
           AND revoked_at IS NULL'
    );
    $statement->execute([
        ':token_hash' => hash('sha256', $token),
    ]);

    return $statement->rowCount() > 0;
}