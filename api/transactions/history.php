<?php
// API: GET /api/transactions/history.php. Payment history for the logged-in customer.
// Owner: David
require_once __DIR__ . '/../../src/autoload.php';
require_once __DIR__ . '/../../src/Helpers/response.php';
require_once __DIR__ . '/../../src/Helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['ok' => false, 'message' => 'Method not allowed.'], 405);
}
$customerId = require_customer();

try {
    $rows = (new Payment(Database::connection(), new SimulatedGateway()))->historyForCustomer($customerId);
    json_out(['ok' => true, 'transactions' => $rows]);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
