<?php
// API: POST /api/auth/login.php  (JSON in/out). Tries customers first, then admins.
// Owner: David
require_once __DIR__ . '/../../src/autoload.php';
require_once __DIR__ . '/../../src/Helpers/response.php';
require_once __DIR__ . '/../../src/Helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

$in = json_in();
$email = (string) ($in['email'] ?? '');
$password = (string) ($in['password'] ?? '');

try {
    $pdo = Database::connection();
    $customer = (new Customer($pdo))->login($email, $password);
    $admin = $customer ? null : (new Admin($pdo))->login($email, $password);

    if (!$customer && !$admin) {
        json_out(['ok' => false, 'message' => 'Email or password is incorrect.'], 401);
    }

    start_session();
    session_regenerate_id(true);
    $_SESSION = [];
    if ($customer) {
        $_SESSION['customer_id'] = (int) $customer['customer_id'];
        $role = 'customer';
    } else {
        $_SESSION['admin_id'] = (int) $admin['admin_id'];
        $role = 'admin';
    }
    json_out(['ok' => true, 'role' => $role]);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
