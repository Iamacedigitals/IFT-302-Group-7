<?php
// API: GET /api/payments/status.php?id=<payment_id>. Status of one of this customer's payments. Login required.
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
    json_out(['ok' => false, 'message' => 'Missing payment id.'], 422);
}

try {
    $payment = (new Payment(Database::connection(), new SimulatedGateway()))->statusForCustomer($paymentId, $customerId);
    if (!$payment) {
        json_out(['ok' => false, 'message' => 'Payment not found.'], 404);
    }
    json_out(['ok' => true, 'payment' => $payment]);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
