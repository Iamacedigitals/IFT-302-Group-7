<?php
// API: GET /api/auth/me.php. Who is logged in (used for the header name).
// Owner: David
require_once __DIR__ . '/../../src/autoload.php';
require_once __DIR__ . '/../../src/Helpers/response.php';
require_once __DIR__ . '/../../src/Helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_out(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    $pdo = Database::connection();
    if ($customerId = current_customer_id()) {
        $profile = (new Customer($pdo))->profile($customerId);
        if ($profile) {
            json_out(['ok' => true, 'role' => 'customer', 'name' => $profile['name'],
                      'email' => $profile['email'], 'meter' => $profile['meter_number']]);
        }
    }
    if ($adminId = current_admin_id()) {
        $profile = (new Admin($pdo))->profile($adminId);
        if ($profile) {
            json_out(['ok' => true, 'role' => 'admin', 'name' => $profile['name'], 'email' => $profile['email']]);
        }
    }
    json_out(['ok' => false, 'message' => 'Please log in first.'], 401);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
