<?php
require __DIR__ . '/../src/autoload.php';
header('Content-Type: text/plain');
try {
    $pdo = Database::connection();
    echo "Connected. Driver: " . Database::driver() . "\n";
    echo "Customers: " . $pdo->query('select count(*) from customers')->fetchColumn();
} catch (Throwable $e) {
    echo "ERROR: " . $e->getMessage();
}