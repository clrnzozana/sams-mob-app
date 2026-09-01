<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';

header('Content-Type: application/json; charset=utf-8');

// Test environment loading
$loaded = getenv('SAMS_ENVIRONMENT_LOADED') === 'true';
$user = getenv('SAMS_DB_USER');
$password = getenv('SAMS_DB_PASSWORD');
$host = getenv('SAMS_DB_HOST');
$port = getenv('SAMS_DB_PORT');
$name = getenv('SAMS_DB_NAME');

$result = [
    'env_file_path' => __DIR__ . '/.env',
    'env_file_exists' => file_exists(__DIR__ . '/.env'),
    'environment_loaded' => $loaded,
    'variables' => [
        'SAMS_DB_HOST' => $host ?: '(not set, will use default 127.0.0.1)',
        'SAMS_DB_PORT' => $port ?: '(not set, will use default 3306)',
        'SAMS_DB_NAME' => $name ?: '(not set, will use default sams-db)',
        'SAMS_DB_USER' => $user === false ? '(NOT SET - ERROR!)' : ($user ?: '(empty string)'),
        'SAMS_DB_PASSWORD' => $password === false ? '(NOT SET)' : ($password ? '(set, hidden)' : '(empty string)'),
    ],
];

http_response_code(200);
echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
