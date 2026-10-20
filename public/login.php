<?php
$pageTitle = 'Log in';
$page      = 'login';
$layout    = 'auth';
$root      = '';
require __DIR__ . '/../includes/header.php';
?>
  <div class="center-page auth-layout">
    <main class="panel panel--login auth-panel">
      <div class="auth-brand-mobile"><a class="logo logo--auth-brand" href="login.php"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"></path></svg></span><span>GridConnect</span></a></div>
      <div class="auth-heading"><h1>Log in</h1><p class="subtitle">Welcome back to GridConnect</p></div>

      <!-- TODO(backend): post to api/login.php once the PHP login exists. app.js handles this form for now. -->
      <form id="login-form" action="login.php" method="post">
        <p id="login-message" class="form-message form-message--error" role="alert" hidden></p>

        <div class="field">
          <label class="label--caps" for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="amina.bello@example.ng" required>
        </div>

        <div class="field">
          <label class="label--caps" for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="••••••••" minlength="8" required>
        </div>

        <button type="submit" class="btn btn--block">Log in</button>
      </form>

      <p class="panel-foot">New customer? <a href="register.php">Register</a></p>
    </main>
    <div class="auth-brand-desktop"><a class="logo logo--auth-brand" href="login.php"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"></path></svg></span><span>GridConnect</span></a></div>
  </div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
