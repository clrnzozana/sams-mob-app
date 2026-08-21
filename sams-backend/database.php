<?php

declare(strict_types=1);

function mobileDatabase(): PDO
{
    $host = getenv('SAMS_DB_HOST') ?: '127.0.0.1';
    $port = getenv('SAMS_DB_PORT') ?: '3306';
    $name = getenv('SAMS_DB_NAME') ?: 'sams-db';
    $user = getenv('SAMS_DB_USER');
    $password = getenv('SAMS_DB_PASSWORD');

    if ($user === false || $password === false) {
        throw new RuntimeException('Database credentials are not configured.');
    }

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    return new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}