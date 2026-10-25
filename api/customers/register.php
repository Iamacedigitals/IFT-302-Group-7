<?php
// API: POST /api/customers/register.php  (JSON in/out)
// Owner: David
require_once __DIR__ . '/../../src/autoload.php';
require_once __DIR__ . '/../../src/Helpers/response.php';
require_once __DIR__ . '/../../src/Helpers/validator.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['ok' => false, 'message' => 'Method not allowed.'], 405);
}

$in = json_in();
$data = [
    'name'         => trim($in['full_name'] ?? ''),
    'email'        => strtolower(trim($in['email'] ?? '')),
    'phone'        => trim($in['phone'] ?? ''),
    'address'      => trim($in['address'] ?? ''),
    'meter_number' => trim($in['meter_number'] ?? ''),
    'password'     => (string) ($in['password'] ?? ''),
];

if ($data['name'] === '' || !is_valid_email($data['email']) || !is_valid_phone($data['phone'])
    || !is_valid_meter($data['meter_number']) || strlen($data['password']) < 8) {
    json_out(['ok' => false, 'message' => 'Please check your details and try again.'], 422);
}

try {
    $id = (new Customer(Database::connection()))->register($data);
    json_out(['ok' => true, 'customer_id' => $id, 'message' => 'Account created.'], 201);
} catch (InvalidArgumentException $e) {
    json_out(['ok' => false, 'message' => $e->getMessage()], 422);
} catch (Throwable $e) {
    error_log($e->getMessage());
    json_out(['ok' => false, 'message' => 'Something went wrong. Please try again.'], 500);
}
