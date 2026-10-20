<?php
// Meter: lookup by meter number, link to customer
// Owner: David

class Meter
{
    public function __construct(private PDO $pdo) {}

    public function findByNumber(string $meterNumber): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT meter_id, customer_id, meter_number FROM meters WHERE meter_number = :number'
        );
        $stmt->execute([':number' => $meterNumber]);
        return $stmt->fetch() ?: null;
    }

    public function link(int $customerId, string $meterNumber): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO meters (customer_id, meter_number) VALUES (:customer, :number)'
        );
        $stmt->execute([':customer' => $customerId, ':number' => $meterNumber]);
        return (int) Database::lastId($this->pdo, 'meters', 'meter_id');
    }
}
