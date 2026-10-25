<?php
$pageTitle = 'Previous Bills';
$page      = 'bills';
$nav       = 'customer';
$active    = 'bills';
$guard     = 'customer';
$root      = '';
require __DIR__ . '/../includes/header.php';
?>
        <div class="page-head">
          <p class="eyebrow">Account statements</p>
          <h1>Previous Bills</h1>
        </div>

        <section class="card card--flush">
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Bill ID</th><th>Billing Period</th><th>Units</th><th class="num">Amount</th><th>Due Date</th><th class="num">Status</th></tr>
              </thead>
              <tbody id="rows"></tbody>
            </table>
          </div>
        </section>
<?php require __DIR__ . '/../includes/footer.php'; ?>
