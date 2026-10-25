<?php
/*
 * Shared <head>, body opening, and (app layout only) sidebar + topbar.
 * Before including this file, a page sets:
 *   $pageTitle  e.g. 'Dashboard'
 *   $page       key read by assets/js/app.js, e.g. 'dashboard'
 *   $root       '' for public/ pages, '../' for public/admin/ pages
 *   $layout     'app' (sidebar), 'auth' (login/register), 'center' (pay/receipt)
 *   $nav        'customer' or 'admin' (app layout only)
 *   $active     nav key to highlight (app layout only)
 *   $guard      'customer', 'admin', or '' (enforced on the server below)
 */
require_once __DIR__ . '/../src/Helpers/session.php';

$pageTitle = $pageTitle ?? 'GridConnect';
$page      = $page ?? '';
$root      = $root ?? '';
$layout    = $layout ?? 'app';
$nav       = $nav ?? 'customer';
$active    = $active ?? '';
$guard     = $guard ?? '';
$bodyClass = $layout === 'auth' ? 'auth-page' : '';

// Server-side page guard: send visitors without the right login to the login page.
if (($guard === 'customer' && !current_customer_id()) || ($guard === 'admin' && !current_admin_id())) {
    header('Location: ' . $root . 'login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($pageTitle) ?> – GridConnect</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= $root ?>assets/css/style.css">
  <link rel="icon" href="<?= $root ?>assets/img/flash.png">
</head>
<body class="<?= $bodyClass ?>" data-root="<?= $root ?>" data-page="<?= $page ?>" data-guard="<?= $guard ?>">
<?php if ($layout === 'app'): ?>
  <div class="app">
    <?php require __DIR__ . '/sidebar.php'; ?>
    <div class="sidebar-backdrop" data-menu-close aria-hidden="true"></div>

    <header class="topbar"><button type="button" class="mobile-menu-toggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="gridconnect-sidebar"><span></span><span></span><span></span></button><div class="user-chip"><span class="user-avatar" aria-hidden="true">A</span><span class="user-name"></span></div></header>

    <main class="main">
      <div class="content">
<?php endif; ?>
