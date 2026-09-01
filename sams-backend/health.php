<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
http_response_code(200);

echo json_encode([
    'status' => 'ok',
    'service' => 'NU SAMS Mobile Backend',
    'timestamp' => date('Y-m-d H:i:s'),
]);
