<?php
$pageTitle = 'Dashboard';
$page      = 'dashboard';
$nav       = 'customer';
$active    = 'dashboard';
$guard     = 'customer';
$root      = '';
// TODO(backend): add a server-side session check here once login is handled by PHP.
require __DIR__ . '/../includes/header.php';
?>
        <section class="card" aria-labelledby="account-title">
          <p class="eyebrow" id="account-title" style="color:#b9cdf5">Account profile</p>
          <div class="field-grid" style="margin-top:16px">
            <div><p class="field-label">Customer Name</p><p class="field-value field-value--strong" id="customer-name">—</p></div>
            <div><p class="field-label">Email Address</p><p class="field-value" id="customer-email">—</p></div>
            <div><p class="field-label">Meter Number</p><p class="field-value field-value--mono" id="customer-meter">—</p></div>
          </div>
        </section>

        <section class="card" aria-labelledby="check-title">
          <h2 id="check-title">Check your bill</h2>
          <!-- TODO(backend): replace the demo lookup in app.js with GET api/bills.php?meter=... -->
          <form id="check-bill-form" novalidate>
            <div class="form-row">
              <div class="grow">
                <label for="meter-number">Meter Number</label>
                <input type="text" id="meter-number" name="meter_number" placeholder="45012345678" inputmode="numeric" required>
              </div>
              <button type="submit" class="btn">Get bill</button>
            </div>
            <p id="meter-error" class="field-error" role="alert" hidden></p>
          </form>
        </section>

        <section class="card" id="current-bill" aria-labelledby="bill-title">
          <h2 id="bill-title" class="sr-only" style="position:absolute;left:-9999px">Current bill</h2>
          <div class="card-row">
            <div>
              <p class="field-label">Billing Period</p>
              <p class="field-value field-value--strong" id="bill-period">—</p>
            </div>
            <span class="badge badge--pending" id="bill-status">—</span>
          </div>
          <div class="field-grid">
            <div><p class="field-label">Units Consumed</p><p class="field-value" id="bill-units">—</p></div>
            <div><p class="field-label">Due Date</p><p class="field-value" id="bill-due">—</p></div>
            <div><p class="field-label">Amount Due</p><p class="amount" id="bill-amount">—</p></div>
          </div>
          <div class="card-actions"><a class="btn" id="pay-now" href="pay.php">Pay now</a></div>
        </section>
<?php require __DIR__ . '/../includes/footer.php'; ?>
