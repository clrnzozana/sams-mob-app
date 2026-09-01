<?php

declare(strict_types=1);

/**
 * Load environment variables from .env file
 * Must be called once at application startup
 */
function loadEnv(string $envFilePath = __DIR__ . '/.env'): void
{
    if (!file_exists($envFilePath)) {
        throw new RuntimeException("Environment file not found: {$envFilePath}");
    }

    $lines = file($envFilePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        throw new RuntimeException("Failed to read environment file: {$envFilePath}");
    }

    foreach ($lines as $line) {
        // Skip comments
        if (str_starts_with(trim($line), '#')) {
            continue;
        }

        // Parse KEY=VALUE
        if (str_contains($line, '=')) {
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            // Only set if not already set by environment
            if (!empty($key) && getenv($key) === false) {
                putenv("{$key}={$value}");
            }
        }
    }
}

// Auto-load if this file is included (only once)
if (getenv('SAMS_ENVIRONMENT_LOADED') !== 'true') {
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        try {
            loadEnv($envFile);
            putenv('SAMS_ENVIRONMENT_LOADED=true');
        } catch (RuntimeException $e) {
            // Log but don't fail - will be caught in database.php
            error_log("Warning: Failed to load .env: " . $e->getMessage());
        }
    }
}
