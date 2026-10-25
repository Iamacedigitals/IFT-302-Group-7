<?php
$pageTitle = 'Payment Receipt';
$page      = 'receipt';
$layout    = 'center';
$guard     = 'customer';
$root      = '';
require __DIR__ . '/../includes/header.php';
?>
  <div class="center-page">
    <a class="logo logo--large" href="dashboard.php"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg></span>GridConnect</a>
    <main class="panel">
      <div class="receipt-top">
        <div>
          <p class="eyebrow">Transaction confirmation</p>
          <h1>Payment Receipt</h1>
        </div>
        <span class="badge badge--paid-green badge--dot">Paid</span>
      </div>

      <div class="receipt-amount"><span>Amount Settled</span><strong>—</strong></div>

      <ul class="receipt-list">
        <li><span>Receipt Number</span><span class="strong">—</span></li>
        <li><span>Timestamp</span><span>—</span></li>
        <li><span>Account Holder</span><span class="strong" style="letter-spacing:0">—</span></li>
        <li><span>Meter Token / ID</span><span class="strong">—</span></li>
        <li><span>Billing Period</span><span>—</span></li>
        <li><span>Payment Method</span><span>—</span></li>
      </ul>

      <div class="receipt-actions">
        <button type="button" class="btn btn--ghost" onclick="window.print()">Print</button>
        <a class="btn" href="dashboard.php">Back to dashboard</a>
      </div>
    </main>
  </div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
