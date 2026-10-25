<?php
$pageTitle = 'Customers';
$page      = 'admin-customers';
$nav       = 'admin';
$active    = 'admin-customers';
$guard     = 'admin';
$root      = '../';
require __DIR__ . '/../../includes/header.php';
?>
        <div class="page-head">
          <h1>Customers</h1>
          <p class="subtitle">Directory of registered utility consumers and active telemetry endpoints.</p>
        </div>

        <form class="search" role="search" action="#" method="get">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input type="search" id="search" name="q" placeholder="Search customers by name, email, or meter number..." aria-label="Search customers">
        </form>

        <section class="card card--flush">
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Phone</th><th>Meter Number</th></tr>
              </thead>
              <tbody id="rows"></tbody>
            </table>
          </div>
        </section>
<?php require __DIR__ . '/../../includes/footer.php'; ?>
