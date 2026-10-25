<?php
$pageTitle = 'Make Payment';
$page      = 'pay';
$layout    = 'center';
$guard     = 'customer';
$root      = '';
require __DIR__ . '/../includes/header.php';
?>
  <div class="center-page">
    <a class="logo logo--large" href="dashboard.php"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg></span>GridConnect</a>
    <main class="panel">
      <p class="eyebrow">Checkout process</p>
      <h1>Make Payment</h1>

      <div class="summary-box">
        <div class="summary-row"><span>Bill ID</span><strong id="pay-bill-id">—</strong></div>
        <div class="summary-row"><span>Amount due</span><span class="big" id="pay-amount">—</span></div>
      </div>

      <!-- TODO(backend): post to api/payment.php once the gateway endpoint exists. app.js simulates the payment for now. -->
      <form id="payment-form" action="pay.php" method="post">
        <input type="hidden" name="bill_id" value="">
        <p id="payment-message" class="form-message form-message--error" role="alert" hidden></p>

        <fieldset style="border:0">
          <legend class="method-title">Select Payment Method</legend>
          <label class="method">
            <span class="method-left"><input type="radio" name="payment_method" value="card" checked> Debit / Credit Card</span>
            <span class="hint">Instant</span>
          </label>
          <label class="method">
            <span class="method-left"><input type="radio" name="payment_method" value="bank_transfer"> Bank Transfer</span>
            <span class="hint">Direct</span>
          </label>
        </fieldset>

        <p class="test-note">Test mode: this is a simulated payment. No real money is charged.</p>
        <button type="submit" class="btn btn--block payment-submit"><span class="payment-submit__label">Make Payment</span><span class="payment-spinner" aria-hidden="true" hidden></span></button>
      </form>
    </main>
  </div>

  <div class="payment-success-overlay" id="payment-success" role="dialog" aria-modal="true" aria-labelledby="payment-success-title" hidden>
    <div class="payment-success-dialog">
      <div class="payment-success-check" aria-hidden="true">✓</div>
      <h2 id="payment-success-title">Payment Successful!</h2>
      <p>Your simulated payment is complete. Preparing your receipt…</p>
    </div>
  </div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
