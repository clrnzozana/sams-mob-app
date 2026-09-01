<?php

declare(strict_types=1);

require_once __DIR__ . '/env.php';
require_once __DIR__ . '/database.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$diagnostics = [
    'status' => 'error',
    'timestamp' => (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s'),
    'checks' => [],
];

// Check 1: Environment loaded
$diagnostics['checks']['env_loaded'] = [
    'ok' => getenv('SAMS_ENVIRONMENT_LOADED') === 'true',
    'message' => getenv('SAMS_ENVIRONMENT_LOADED') === 'true' 
        ? '.env file loaded successfully' 
        : '.env file not loaded',
];

// Check 2: Database credentials
$dbUser = getenv('SAMS_DB_USER');
$diagnostics['checks']['db_credentials'] = [
    'ok' => !empty($dbUser),
    'message' => !empty($dbUser) 
        ? "Database user configured: {$dbUser}" 
        : 'SAMS_DB_USER not set in .env file',
];

// Check 3: Database connection
$dbConnected = false;
$dbError = null;
try {
    $database = mobileDatabase();
    $statement = $database->query('SELECT 1');
    $dbConnected = $statement !== false;
    $diagnostics['checks']['db_connection'] = [
        'ok' => true,
        'message' => 'Database connection successful',
        'host' => getenv('SAMS_DB_HOST') ?: '127.0.0.1',
        'port' => getenv('SAMS_DB_PORT') ?: '3306',
        'database' => getenv('SAMS_DB_NAME') ?: 'sams-db',
    ];
} catch (RuntimeException $e) {
    $dbError = $e->getMessage();
    $diagnostics['checks']['db_connection'] = [
        'ok' => false,
        'message' => 'Environment configuration error',
        'error' => $dbError,
    ];
} catch (PDOException $e) {
    $dbError = $e->getMessage();
    $diagnostics['checks']['db_connection'] = [
        'ok' => false,
        'message' => 'Database connection failed',
        'error' => $dbError,
        'troubleshooting' => [
            '1. Verify MySQL/MariaDB is running',
            '2. Check SAMS_DB_HOST and SAMS_DB_PORT in .env',
            '3. Verify SAMS_DB_USER and password are correct',
            '4. Run: mysql -u ' . (getenv('SAMS_DB_USER') ?: 'root') . ' -p -e "SELECT 1;"',
        ],
    ];
}

// Check 4: Test data
if ($dbConnected) {
    try {
        $database = mobileDatabase();
        $statement = $database->query('SELECT COUNT(*) as count FROM users');
        $result = $statement->fetch();
        $userCount = (int) ($result['count'] ?? 0);
        
        $diagnostics['checks']['test_data'] = [
            'ok' => $userCount > 0,
            'message' => $userCount > 0 
                ? "Database has $userCount user(s)" 
                : 'No users in database',
            'user_count' => $userCount,
        ];
        
        if ($userCount === 0) {
            $diagnostics['checks']['test_data']['next_steps'] = [
                'Run: mysql -u root -p sams-db < sams-db.sql',
                'Or insert test user manually in database',
            ];
        }
    } catch (Throwable $e) {
        $diagnostics['checks']['test_data'] = [
            'ok' => false,
            'message' => 'Cannot query users table',
            'error' => $e->getMessage(),
        ];
    }
}

// Overall status
$allOk = collect($diagnostics['checks'], function($check) {
    return ($check['ok'] ?? false) === true;
});

$diagnostics['status'] = $allOk ? 'ok' : 'error';
$diagnostics['message'] = $allOk 
    ? 'Backend is ready for authentication'
    : 'Backend has configuration issues - see checks above';

http_response_code($allOk ? 200 : 500);
echo json_encode($diagnostics, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

function collect(array $array, callable $callback): bool {
    foreach ($array as $item) {
        if (!$callback($item)) {
            return false;
        }
    }
    return true;
}
