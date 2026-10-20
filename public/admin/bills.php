<?php
$pageTitle = 'Bills';
$page      = 'admin-bills';
$nav       = 'admin';
$active    = 'admin-bills';
$guard     = 'admin';
$root      = '../';
require __DIR__ . '/../../includes/header.php';
?>
        <div class="page-head">
          <h1>Bills</h1>
          <p class="subtitle">Manage utility ledger accounts, reconciliation cycles, and bill dispatch statuses.</p>
        </div>

        <form class="search" role="search" action="#" method="get">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" id="search" name="q" placeholder="Search bills by bill ID, customer name, or meter number..." aria-label="Search bills">
        </form>

        <section class="card card--flush">
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Bill ID</th><th>Customer</th><th>Meter Number</th><th>Billing Period</th><th class="num">Amount</th><th class="num">Status</th></tr>
              </thead>
              <tbody id="rows"></tbody>
            </table>
          </div>
        </section>
<?php require __DIR__ . '/../../includes/footer.php'; ?>
