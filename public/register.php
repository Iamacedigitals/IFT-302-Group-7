<?php
$pageTitle = 'Create account';
$page      = 'register';
$layout    = 'auth';
$root      = '';
require __DIR__ . '/../includes/header.php';
?>
  <div class="center-page auth-layout">
    <main class="panel panel--register auth-panel">
      <div class="auth-brand-mobile"><a class="logo logo--auth-brand" href="login.php"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"></path></svg></span><span>GridConnect</span></a></div>
      <h1>Create account</h1>

      <!-- TODO(backend): post to api/register.php once it exists. app.js handles this form for now. -->
      <form id="register-form" action="register.php" method="post">
        <p id="register-message" class="form-message form-message--error" role="alert" hidden></p>

        <div class="field">
          <label for="full-name">Full name</label>
          <input type="text" id="full-name" name="full_name" placeholder="Jane Doe" autocomplete="name" required>
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" placeholder="jane@example.com" autocomplete="email" required>
        </div>

        <div class="field">
          <label for="phone">Phone</label>
          <input type="tel" id="phone" name="phone" placeholder="08012345678" inputmode="numeric" autocomplete="tel-national" pattern="0[789][0-9]{9}" minlength="11" maxlength="11" required>
        </div>

        <div class="field">
          <label for="address">Address</label>
          <input type="text" id="address" name="address" placeholder="123 Electric Ave, Suite 400" autocomplete="street-address" required>
        </div>

        <div class="field">
          <label for="meter-number">Meter number</label>
          <input type="text" id="meter-number" name="meter_number" placeholder="Enter your meter number" autocomplete="off" required>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="••••••••" minlength="8" autocomplete="new-password" required>
        </div>

        <div class="field">
          <label for="confirm-password">Confirm password</label>
          <input type="password" id="confirm-password" name="confirm_password" placeholder="••••••••" minlength="8" autocomplete="new-password" required>
        </div>

        <button type="submit" class="btn btn--block">Create account</button>
      </form>

      <p class="panel-foot">Already have an account? <a href="login.php">Log in</a></p>
    </main>
    <div class="auth-brand-desktop"><a class="logo logo--auth-brand" href="login.php"><span class="logo-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z"></path></svg></span><span>GridConnect</span></a></div>
  </div>
<?php require __DIR__ . '/../includes/footer.php'; ?>
