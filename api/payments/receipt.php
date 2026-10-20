<?php
// API: GET /api/payments/receipt.php?id=<payment_id>. Login required; only your own receipts.
// Owner: David
require_once __DIR__ . '/../../src/autoload.php';
require_once __DIR__ . '/../../src/Helpers/response.php';
require_once __DIR__ . '/../../src/Helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['ok' => false, 'message' => 'Method not allowed.'], 405);
}
$customerId = require_customer();

$paymentId = (int) ($_GET['id'] ?? 0);
if ($paymentId <= 0) {
    json_out(['ok' => false, 'message' => 'Missing receipt id.'], 422);
}

try {
    $receipt = (new Payment(Database::connection(), new SimulatedGateway()))->receiptForCustomer($paymentId, $customerId);
    if (!$receipt) {
        json_out(['ok' => false, 'message' => 'Receipt not found.'], 404);
    }
    json_out(['ok' => true, 'receipt' => $receipt]);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
