<?php
// API: GET /api/bills/current.php?meter=  (meter optional). Login required; only your own meters.
// Without ?meter= it returns your latest unpaid bill.
// Owner: David
require_once __DIR__ . '/../../src/autoload.php';
require_once __DIR__ . '/../../src/Helpers/response.php';
require_once __DIR__ . '/../../src/Helpers/session.php';
require_once __DIR__ . '/../../src/Helpers/validator.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['ok' => false, 'message' => 'Method not allowed.'], 405);
}
$customerId = require_customer();

$meter = trim($_GET['meter'] ?? '');
if ($meter !== '' && !is_valid_meter($meter)) {
    json_out(['ok' => false, 'message' => 'Enter a valid meter number.'], 422);
}

try {
    $bills = new Bill(Database::connection());
    $bill = $meter !== '' ? $bills->currentForMeter($meter, $customerId) : $bills->currentForCustomer($customerId);
    if (!$bill) {
        json_out(['ok' => false, 'message' => 'No unpaid bill was found.'], 404);
    }
    json_out(['ok' => true, 'bill' => $bill]);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
