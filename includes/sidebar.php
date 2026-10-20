<?php
/* Sidebar for customer and admin pages. Uses $nav, $active and $root set by the calling page. */
$items = $nav === 'admin'
    ? [
        'admin-dashboard' => ['admin/dashboard.php', 'Dashboard'],
        'admin-customers' => ['admin/customers.php', 'Customers'],
        'admin-bills'     => ['admin/bills.php', 'Bills'],
        'admin-payments'  => ['admin/payments.php', 'Payments'],
      ]
    : [
        'dashboard'    => ['dashboard.php', 'Dashboard'],
        'bills'        => ['bills.php', 'Previous Bills'],
        'transactions' => ['transactions.php', 'Transaction History'],
      ];
$homeHref = $root . ($nav === 'admin' ? 'admin/dashboard.php' : 'dashboard.php');
?>
<aside class="sidebar" id="gridconnect-sidebar">
  <div>
    <div class="sidebar-top"><a class="logo" href="<?= $homeHref ?>"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"/></svg></span>GridConnect</a></div>
    <nav class="nav" aria-label="Main">
      <?php foreach ($items as $key => [$href, $label]): ?>
      <a href="<?= $root . $href ?>"<?= $key === $active ? ' class="active" aria-current="page"' : '' ?>><?= $label ?></a>
      <?php endforeach; ?>
    </nav>
  </div>
  <div class="sidebar-bottom"><a href="<?= $root ?>logout.php">Logout</a></div>
</aside>
