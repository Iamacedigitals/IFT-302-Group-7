<?php
// API: POST /api/payments/create.php  (JSON in/out). Login required.
// Owner: David
require_once __DIR__ . '/../../src/autoload.php';
require_once __DIR__ . '/../../src/Helpers/response.php';
require_once __DIR__ . '/../../src/Helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['ok' => false, 'message' => 'Method not allowed.'], 405);
}
$customerId = require_customer();

$in = json_in();
try {
    $payment = new Payment(Database::connection(), new SimulatedGateway());
    $result = $payment->pay($customerId, (int) ($in['bill_id'] ?? 0), (string) ($in['payment_method'] ?? ''));
    json_out(['ok' => $result['status'] === 'success'] + $result, $result['status'] === 'success' ? 201 : 402);
} catch (InvalidArgumentException $e) {
    json_out(['ok' => false, 'message' => $e->getMessage()], 422);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
