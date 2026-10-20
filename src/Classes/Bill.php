<?php
// Bill: current bill, previous bills
// Owner: David

class Bill
{
    private const COLUMNS = 'b.bill_id, m.meter_number, b.period_start, b.period_end,
                             b.units_kwh, b.amount, b.due_date, b.bill_status';

    public function __construct(private PDO $pdo) {}

    // Latest unpaid bill for one meter, only if the meter belongs to this customer.
    public function currentForMeter(string $meterNumber, int $customerId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT ' . self::COLUMNS . '
             FROM bills b
             JOIN meters m ON m.meter_id = b.meter_id
             WHERE m.meter_number = :number AND m.customer_id = :customer AND b.bill_status <> :paid
             ORDER BY b.billing_date DESC
             LIMIT 1'
        );
        $stmt->execute([':number' => $meterNumber, ':customer' => $customerId, ':paid' => 'paid']);
        return $stmt->fetch() ?: null;
    }

    // Latest unpaid bill across all of this customer's meters.
    public function currentForCustomer(int $customerId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT ' . self::COLUMNS . '
             FROM bills b
             JOIN meters m ON m.meter_id = b.meter_id
             WHERE m.customer_id = :customer AND b.bill_status <> :paid
             ORDER BY b.billing_date DESC
             LIMIT 1'
        );
        $stmt->execute([':customer' => $customerId, ':paid' => 'paid']);
        return $stmt->fetch() ?: null;
    }

    // All bills for this customer's meters, newest first.
    public function historyForCustomer(int $customerId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT ' . self::COLUMNS . '
             FROM bills b
             JOIN meters m ON m.meter_id = b.meter_id
             WHERE m.customer_id = :customer
             ORDER BY b.billing_date DESC'
        );
        $stmt->execute([':customer' => $customerId]);
        return $stmt->fetchAll();
    }
}
