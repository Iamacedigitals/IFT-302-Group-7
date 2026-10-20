<?php
$pageTitle = 'Admin Dashboard';
$page      = 'admin-dashboard';
$nav       = 'admin';
$active    = 'admin-dashboard';
$guard     = 'admin';
$root      = '../';
// TODO(backend): add a server-side admin role check here.
require __DIR__ . '/../../includes/header.php';
?>
        <h1>Admin Dashboard</h1>

        <div class="stats">
          <div class="stat"><p class="field-label">Total Customers</p><p class="stat-value">—</p></div>
          <div class="stat"><p class="field-label">Total Bills</p><p class="stat-value">—</p></div>
          <div class="stat"><p class="field-label">Total Payments Received</p><p class="stat-value">—</p></div>
          <div class="stat"><p class="field-label">Pending Payments</p><p class="stat-value">—</p></div>
        </div>

        <section class="card card--flush">
          <h2 class="card-title">Recent payments</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Transaction ID</th><th>Customer</th><th>Meter Number</th><th class="num">Amount</th><th class="num">Status</th></tr>
              </thead>
              <tbody id="rows"></tbody>
            </table>
          </div>
        </section>
<?php require __DIR__ . '/../../includes/footer.php'; ?>
