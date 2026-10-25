<?php
// Test-mode gateway. No real money moves. Fails a share of requests so the failed-payment path can be shown.
// Owner: David

class SimulatedGateway implements PaymentGateway
{
    public function __construct(private float $failRate = 0.2) {}

    public function charge(float $amount, string $method): array
    {
        $ok = (mt_rand() / mt_getrandmax()) >= $this->failRate;
        return [
            'status'         => $ok ? 'success' : 'failed',
            'transaction_id' => 'GW-' . random_int(100000, 999999),
        ];
    }
}
