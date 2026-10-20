<?php
// Payment: process, status, receipt, history
// Owner: David

class Payment
{
    public function __construct(private PDO $pdo, private PaymentGateway $gateway) {}

    // Pays one unpaid bill. Amount comes from the database, never from the request.
    // Records the payment, transaction and (on success) receipt in one transaction.
    public function pay(int $customerId, int $billId, string $method): array
    {
        if (!in_array($method, ['card', 'bank_transfer'], true)) {
            throw new InvalidArgumentException('Unknown payment method.');
        }

        $stmt = $this->pdo->prepare(
            'SELECT b.bill_id, b.amount
             FROM bills b
             JOIN meters m ON m.meter_id = b.meter_id
             WHERE b.bill_id = :bill AND m.customer_id = :customer AND b.bill_status <> :paid'
        );
        $stmt->execute([':bill' => $billId, ':customer' => $customerId, ':paid' => 'paid']);
        $bill = $stmt->fetch();
        if (!$bill) {
            throw new InvalidArgumentException('No unpaid bill was found.');
        }

        $this->pdo->beginTransaction();
        try {
            $ins = $this->pdo->prepare(
                'INSERT INTO payments (bill_id, amount, payment_method, payment_status)
                 VALUES (:bill, :amount, :method, :status)'
            );
            $ins->execute([
                ':bill'   => $billId,
                ':amount' => $bill['amount'],
                ':method' => $method,
                ':status' => 'pending',
            ]);
            $paymentId = (int) Database::lastId($this->pdo, 'payments', 'payment_id');

            $result = $this->gateway->charge((float) $bill['amount'], $method);
            $ok = $result['status'] === 'success';

            $upd = $this->pdo->prepare(
                'UPDATE payments SET payment_status = :status, gateway_transaction_id = :gw
                 WHERE payment_id = :id'
            );
            $upd->execute([':status' => $result['status'], ':gw' => $result['transaction_id'], ':id' => $paymentId]);

            $tx = $this->pdo->prepare(
                'INSERT INTO transactions (customer_id, payment_id, amount, status)
                 VALUES (:customer, :payment, :amount, :status)'
            );
            $tx->execute([
                ':customer' => $customerId,
                ':payment'  => $paymentId,
                ':amount'   => $bill['amount'],
                ':status'   => $result['status'],
            ]);

            $receiptNumber = null;
            if ($ok) {
                $this->pdo->prepare('UPDATE bills SET bill_status = :paid WHERE bill_id = :id')
                    ->execute([':paid' => 'paid', ':id' => $billId]);

                $receiptNumber = 'REC-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(3)));
                $this->pdo->prepare(
                    'INSERT INTO receipts (payment_id, receipt_number) VALUES (:payment, :number)'
                )->execute([':payment' => $paymentId, ':number' => $receiptNumber]);
            }

            $this->pdo->commit();
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }

        return [
            'status'         => $result['status'],
            'payment_id'     => $paymentId,
            'receipt_number' => $receiptNumber,
            'message'        => $ok ? 'Payment successful.' : 'Payment failed. No receipt was created.',
        ];
    }

    // This customer's payment history, newest first, with receipt numbers where they exist.
    public function historyForCustomer(int $customerId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT t.transaction_id, t.transaction_date, t.amount, t.status,
                    p.payment_id, p.bill_id, p.payment_method, r.receipt_number,
                    b.period_start, b.period_end
             FROM transactions t
             JOIN payments p ON p.payment_id = t.payment_id
             JOIN bills b ON b.bill_id = p.bill_id
             LEFT JOIN receipts r ON r.payment_id = p.payment_id
             WHERE t.customer_id = :customer
             ORDER BY t.transaction_date DESC'
        );
        $stmt->execute([':customer' => $customerId]);
        return $stmt->fetchAll();
    }

    // One receipt, only if the payment belongs to this customer.
    public function receiptForCustomer(int $paymentId, int $customerId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT r.receipt_number, r.issue_date, p.payment_id, p.bill_id, p.amount,
                    p.payment_method, c.name AS customer_name, m.meter_number,
                    b.period_start, b.period_end
             FROM receipts r
             JOIN payments p ON p.payment_id = r.payment_id
             JOIN bills b ON b.bill_id = p.bill_id
             JOIN meters m ON m.meter_id = b.meter_id
             JOIN customers c ON c.customer_id = m.customer_id
             WHERE p.payment_id = :payment AND m.customer_id = :customer'
        );
        $stmt->execute([':payment' => $paymentId, ':customer' => $customerId]);
        return $stmt->fetch() ?: null;
    }
}
