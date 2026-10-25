<?php
// API: GET /api/admin/payments.php?q=  (search optional). Admin login required.
// Owner: David
require_once __DIR__ . '/../../src/autoload.php';
require_once __DIR__ . '/../../src/Helpers/response.php';
require_once __DIR__ . '/../../src/Helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['ok' => false, 'message' => 'Method not allowed.'], 405);
}
require_admin();

try {
    $rows = (new Admin(Database::connection()))->payments(trim($_GET['q'] ?? ''));
    json_out(['ok' => true, 'payments' => $rows]);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
