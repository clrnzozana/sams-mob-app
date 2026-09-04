<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

function mobileDatabase(): PDO
{
    $host = getenv('SAMS_DB_HOST') ?: '127.0.0.1';
    $port = getenv('SAMS_DB_PORT') ?: '3306';
    $name = getenv('SAMS_DB_NAME') ?: 'sams-db';
    $user = getenv('SAMS_DB_USER');
    $password = getenv('SAMS_DB_PASSWORD');

    // Check if credentials are not set (getenv returns false when not found)
    if ($user === false) {
        throw new RuntimeException(
            'Database credentials are not configured. ' .
            'SAMS_DB_USER is not set in .env file. ' .
            'Please ensure sams-backend/.env exists and contains: SAMS_DB_USER=root'
        );
    }
    
    if ($password === false) {
        throw new RuntimeException(
            'Database password configuration error. ' .
            'SAMS_DB_PASSWORD is not set in .env file. ' .
            'If MySQL root has no password, use: SAMS_DB_PASSWORD='
        );
    }

    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";

    try {
        return new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        // Re-throw with better context
        throw new PDOException(
            'Database connection failed: ' . $e->getMessage() . 
            ' | Host: ' . $host . ' | Port: ' . $port . ' | Database: ' . $name . 
            ' | User: ' . $user,
            (int) $e->getCode(),
            $e
        );
    }
}