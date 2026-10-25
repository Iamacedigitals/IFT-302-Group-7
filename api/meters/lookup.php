<?php
// API: GET /api/meters/lookup.php?meter=  Checks that a meter belongs to the logged-in customer. Login required.
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
if (!is_valid_meter($meter)) {
    json_out(['ok' => false, 'message' => 'Enter a valid meter number.'], 422);
}

try {
    $row = (new Meter(Database::connection()))->findForCustomer($meter, $customerId);
    if (!$row) {
        json_out(['ok' => false, 'message' => 'Meter not found on this account.'], 404);
    }
    json_out(['ok' => true, 'meter' => $row]);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
