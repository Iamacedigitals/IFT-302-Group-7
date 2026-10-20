<?php
$pageTitle = 'Payments';
$page      = 'admin-payments';
$nav       = 'admin';
$active    = 'admin-payments';
$guard     = 'admin';
$root      = '../';
require __DIR__ . '/../../includes/header.php';
?>
        <div class="page-head">
          <h1>Payments</h1>
          <p class="subtitle">Real-time ledger of utility meter clearances and transaction statuses.</p>
        </div>

        <form class="search" role="search" action="#" method="get">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" id="search" name="q" placeholder="Search payments by transaction ID, customer, or meter number..." aria-label="Search payments">
        </form>

        <section class="card card--flush">
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Transaction ID</th><th>Customer</th><th>Meter Number</th><th class="num">Amount</th><th>Date</th><th class="num">Status</th></tr>
              </thead>
              <tbody id="rows"></tbody>
            </table>
          </div>
        </section>
<?php require __DIR__ . '/../../includes/footer.php'; ?>
