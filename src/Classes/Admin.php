<?php
// Admin: login, dashboard totals, and searchable lists for the admin pages
// Owner: David

class Admin
{
    public function __construct(private PDO $pdo) {}

    public function login(string $email, string $password): ?array
    {
        $stmt = $this->pdo->prepare('SELECT admin_id, name, email, password_hash FROM admins WHERE email = :email');
        $stmt->execute([':email' => strtolower(trim($email))]);
        $admin = $stmt->fetch();
        if (!$admin || !password_verify($password, $admin['password_hash'])) {
            return null;
        }
        unset($admin['password_hash']);
        return $admin;
    }

    public function profile(int $adminId): ?array
    {
        $stmt = $this->pdo->prepare('SELECT admin_id, name, email FROM admins WHERE admin_id = :id');
        $stmt->execute([':id' => $adminId]);
        return $stmt->fetch() ?: null;
    }

    public function stats(): array
    {
        return $this->pdo->query(
            "SELECT (SELECT COUNT(*) FROM customers) AS total_customers,
                    (SELECT COUNT(*) FROM bills) AS total_bills,
                    (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'success') AS payments_received,
                    (SELECT COALESCE(SUM(amount), 0) FROM bills WHERE bill_status <> 'paid') AS pending_amount"
        )->fetch();
    }

    public function customers(string $search): array
    {
        $like = '%' . strtolower($search) . '%';
        $stmt = $this->pdo->prepare(
            'SELECT c.customer_id, c.name, c.email, c.phone, m.meter_number
             FROM customers c
             LEFT JOIN meters m ON m.customer_id = c.customer_id
             WHERE LOWER(c.name) LIKE :a OR LOWER(c.email) LIKE :b OR m.meter_number LIKE :c
             ORDER BY c.created_at DESC
             LIMIT 200'
        );
        $stmt->execute([':a' => $like, ':b' => $like, ':c' => $like]);
        return $stmt->fetchAll();
    }

    public function bills(string $search): array
    {
        $like = '%' . strtolower($search) . '%';
        $stmt = $this->pdo->prepare(
            'SELECT b.bill_id, c.name AS customer_name, m.meter_number,
                    b.period_start, b.period_end, b.amount, b.bill_status
             FROM bills b
             JOIN meters m ON m.meter_id = b.meter_id
             JOIN customers c ON c.customer_id = m.customer_id
             WHERE LOWER(c.name) LIKE :a OR m.meter_number LIKE :b OR LOWER(b.bill_status) LIKE :c
             ORDER BY b.billing_date DESC
             LIMIT 200'
        );
        $stmt->execute([':a' => $like, ':b' => $like, ':c' => $like]);
        return $stmt->fetchAll();
    }

    public function payments(string $search): array
    {
        $like = '%' . strtolower($search) . '%';
        $stmt = $this->pdo->prepare(
            'SELECT p.payment_id, p.amount, p.payment_date, p.payment_status, p.payment_method,
                    c.name AS customer_name, m.meter_number
             FROM payments p
             JOIN bills b ON b.bill_id = p.bill_id
             JOIN meters m ON m.meter_id = b.meter_id
             JOIN customers c ON c.customer_id = m.customer_id
             WHERE LOWER(c.name) LIKE :a OR m.meter_number LIKE :b OR LOWER(p.payment_status) LIKE :c
             ORDER BY p.payment_date DESC
             LIMIT 200'
        );
        $stmt->execute([':a' => $like, ':b' => $like, ':c' => $like]);
        return $stmt->fetchAll();
    }
}
