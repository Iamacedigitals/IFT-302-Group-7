<?php
// Contract for any payment provider. The simulated one is used now; a real one can replace it later.
// Owner: David

interface PaymentGateway
{
    /** @return array{status: string, transaction_id: string} status is 'success' or 'failed' */
    public function charge(float $amount, string $method): array;
}
