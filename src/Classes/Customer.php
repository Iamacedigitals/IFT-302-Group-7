<?php
// Customer: register, login, profile
// Owner: David

class Customer
{
    public function __construct(private PDO $pdo) {}

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT customer_id, name, email, phone, address, password_hash
             FROM customers WHERE email = :email'
        );
        $stmt->execute([':email' => strtolower(trim($email))]);
        return $stmt->fetch() ?: null;
    }

    // Returns the customer without the password hash, or null if the login is wrong.
    public function login(string $email, string $password): ?array
    {
        $customer = $this->findByEmail($email);
        if (!$customer || !verify_password($password, $customer['password_hash'])) {
            return null;
        }
        if (password_needs_upgrade($customer['password_hash'])) {
            $this->pdo->prepare('UPDATE customers SET password_hash = :hash WHERE customer_id = :id')
                ->execute([':hash' => hash_password($password), ':id' => $customer['customer_id']]);
        }
        unset($customer['password_hash']);
        return $customer;
    }

    // Name, email and first meter number for the header and dashboard.
    public function profile(int $customerId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT c.name, c.email, m.meter_number
             FROM customers c
             LEFT JOIN meters m ON m.customer_id = c.customer_id
             WHERE c.customer_id = :customer
             ORDER BY m.meter_id
             LIMIT 1'
        );
        $stmt->execute([':customer' => $customerId]);
        return $stmt->fetch() ?: null;
    }

    // Creates the customer, their account and their meter link in one transaction.
    // Throws InvalidArgumentException for problems the user can fix.
    public function register(array $data): int
    {
        $email = strtolower(trim($data['email']));
        if ($this->findByEmail($email)) {
            throw new InvalidArgumentException('An account with this email already exists.');
        }
        $meter = new Meter($this->pdo);
        if ($meter->findByNumber($data['meter_number'])) {
            throw new InvalidArgumentException('That meter number is already registered.');
        }

        $this->pdo->beginTransaction();
        try {
            $stmt = $this->pdo->prepare(
                'INSERT INTO customers (name, email, phone, address, password_hash)
                 VALUES (:name, :email, :phone, :address, :hash)'
            );
            $stmt->execute([
                ':name'    => $data['name'],
                ':email'   => $email,
                ':phone'   => $data['phone'],
                ':address' => $data['address'] ?: null,
                ':hash'    => hash_password($data['password']),
            ]);
            $customerId = (int) Database::lastId($this->pdo, 'customers', 'customer_id');

            $account = $this->pdo->prepare(
                'INSERT INTO accounts (customer_id, account_number) VALUES (:customer, :number)'
            );
            $account->execute([
                ':customer' => $customerId,
                ':number'   => 'ACC-' . strtoupper(bin2hex(random_bytes(5))),
            ]);

            $meter->link($customerId, $data['meter_number']);
            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
        return $customerId;
    }
}
