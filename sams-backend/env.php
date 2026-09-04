<?php

declare(strict_types=1);

function loadEnv(string $envFilePath = __DIR__ . '/.env'): void
{
    if (!is_file($envFilePath)) {
        throw new RuntimeException("Environment file not found: {$envFilePath}");
    }

    $lines = file($envFilePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        throw new RuntimeException("Unable to read environment file: {$envFilePath}");
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key !== '' && getenv($key) === false) {
            putenv("{$key}={$value}");
        }
    }
}

if (getenv('SAMS_ENVIRONMENT_LOADED') !== 'true') {
    $envFile = __DIR__ . '/.env';
    if (is_file($envFile)) {
        loadEnv($envFile);
        putenv('SAMS_ENVIRONMENT_LOADED=true');
    }
}
