<?php
$pageTitle = 'Transaction History';
$page      = 'transactions';
$nav       = 'customer';
$active    = 'transactions';
$guard     = 'customer';
$root      = '';
require __DIR__ . '/../includes/header.php';
?>
        <div class="page-head page-head--row">
          <h1>Transaction History</h1>
          <span class="record-count" id="record-count">0 records</span>
        </div>

        <section class="card card--flush">
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Transaction ID</th><th>Date</th><th>Billing Period</th><th class="num">Amount</th><th>Method</th><th>Status</th><th class="num">Action</th></tr>
              </thead>
              <tbody id="rows"></tbody>
            </table>
          </div>
        </section>
<?php require __DIR__ . '/../includes/footer.php'; ?>
