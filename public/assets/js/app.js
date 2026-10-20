/* GridConnect frontend: demo logic using localStorage only.
   Backend handoff: replace each localStorage read/write with fetch() calls to api/*.php.
   Paths come from <body data-root>, so this file works in public/ and public/admin/. */
(() => {
  'use strict';

  const body = document.body;
  const ROOT = body.dataset.root || '';   // '' in public/, '../' in public/admin/
  const PAGE = body.dataset.page || '';
  const GUARD = body.dataset.guard || ''; // 'customer', 'admin' or ''

  const KEYS = {
    users: 'gc_users_v1', bills: 'gc_bills_v1', payments: 'gc_payments_v1',
    session: 'gc_session_v1', lastReceipt: 'gc_last_receipt_v1', selectedBill: 'gc_selected_bill_v1'
  };
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const money = n => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(n) || 0);
  const read = (key, fallback = []) => { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const today = () => new Date().toISOString();
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = name => (name || 'U').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  const currentUser = () => { const s = read(KEYS.session, null); return s ? read(KEYS.users, []).find(u => u.email === s.email) || null : null; };

  function seed() {
    if (!localStorage.getItem(KEYS.users)) write(KEYS.users, [
      { name: 'Amina Bello', email: 'amina.bello@example.ng', phone: '+234 800 000 0000', address: 'Lagos, Nigeria', meter: '45012345678', password: 'Password123!', role: 'customer' },
      { name: 'GridConnect Admin', email: 'admin@gridconnect.ng', phone: '', address: '', meter: '', password: 'Admin123!', role: 'admin' }
    ]);
    if (!localStorage.getItem(KEYS.bills)) write(KEYS.bills, [
      { id: 'BIL-2026-001', email: 'amina.bello@example.ng', meter: '45012345678', period: 'Sep 1 – Sep 30, 2026', units: 325, due: 'Oct 25, 2026', amount: 18450, status: 'Pending', created: today() },
      { id: 'BIL-2026-000', email: 'amina.bello@example.ng', meter: '45012345678', period: 'Aug 1 – Aug 31, 2026', units: 290, due: 'Sep 15, 2026', amount: 16200, status: 'Paid', created: today() }
    ]);
    if (!localStorage.getItem(KEYS.payments)) write(KEYS.payments, []);
  }
  seed();

  function message(el, text, type = 'error') {
    if (!el) return;
    el.textContent = text; el.hidden = false;
    el.classList.remove('form-message--error', 'form-message--success');
    el.classList.add(type === 'success' ? 'form-message--success' : 'form-message--error');
  }

  function renderTable(tbody, rows, columns, emptyText) {
    if (!tbody) return;
    const labels = $$('thead th', tbody.closest('table')).map(th => th.textContent.trim());
    tbody.innerHTML = rows.length
      ? rows.map(row => '<tr>' + columns.map((col, i) => `<td data-label="${safe(labels[i] || `Detail ${i + 1}`)}">${col(row)}</td>`).join('') + '</tr>').join('')
      : `<tr><td colspan="${columns.length}" class="empty-state">${safe(emptyText)}</td></tr>`;
  }

  // ---------- Shared UI: mobile menu, logout, placeholder links ----------
  const menuToggle = $('.mobile-menu-toggle');
  const sidebar = $('.sidebar');
  const backdrop = $('.sidebar-backdrop');
  function closeMenu() { document.body.classList.remove('menu-open'); menuToggle?.setAttribute('aria-expanded', 'false'); menuToggle?.setAttribute('aria-label', 'Open navigation menu'); }
  function openMenu() { document.body.classList.add('menu-open'); menuToggle?.setAttribute('aria-expanded', 'true'); menuToggle?.setAttribute('aria-label', 'Close navigation menu'); }
  menuToggle?.addEventListener('click', () => document.body.classList.contains('menu-open') ? closeMenu() : openMenu());
  backdrop?.addEventListener('click', closeMenu);
  sidebar?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  // Logout: clear the demo login here; logout.php ends the PHP session.
  $$('a[href$="logout.php"]').forEach(a => a.addEventListener('click', () => localStorage.removeItem(KEYS.session)));

  $$('form.search').forEach(form => form.addEventListener('submit', e => e.preventDefault()));
  $$('a[href="#"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const tr = a.closest('tr');
    if (tr) tr.classList.toggle('row-highlight');
    else message($('.page-head'), 'This action will be connected to the backend API.', 'success');
  }));

  // ---------- Role guard (demo; replace with a PHP session check) ----------
  function requireRole(role) {
    const user = currentUser();
    if (!user) { location.replace(ROOT + 'login.php'); return null; }
    if (role && user.role !== role) { location.replace(ROOT + (user.role === 'admin' ? 'admin/dashboard.php' : 'dashboard.php')); return null; }
    return user;
  }
  const user = GUARD ? requireRole(GUARD) : currentUser();
  if (GUARD && !user) return; // redirect already started

  if (user) {
    const nameEl = $('.user-name');
    if (nameEl) nameEl.textContent = user.role === 'admin' ? 'Administrator' : user.name;
    const avatarEl = $('.user-avatar');
    if (avatarEl) avatarEl.textContent = user.role === 'admin' ? 'AD' : initials(user.name);
  }

  // ---------- Login ----------
  const loginForm = $('#login-form');
  if (loginForm) loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = $('#email').value.trim().toLowerCase(), password = $('#password').value;
    const found = read(KEYS.users, []).find(u => u.email.toLowerCase() === email && u.password === password);
    if (!found) { message($('#login-message'), 'Email or password is incorrect. Please try again.'); return; }
    write(KEYS.session, { email: found.email, role: found.role, created: today() });
    location.href = found.role === 'admin' ? 'admin/dashboard.php' : 'dashboard.php';
  });

  // ---------- Register ----------
  const registerForm = $('#register-form');
  if (registerForm) registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(registerForm);
    const name = String(data.get('full_name') || '').trim();
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || ''), confirm = String(data.get('confirm_password') || '');
    const phone = String(data.get('phone') || '').trim();
    const meter = String(data.get('meter_number') || '').trim();
    // Format rule: local Nigerian mobile number, exactly 11 digits.
    if (!/^0[789]\d{9}$/.test(phone)) { message($('#register-message'), 'Enter a valid 11-digit Nigerian mobile number starting with 070–079, 080–089, or 090–099.'); $('#phone').focus(); return; }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { message($('#register-message'), 'Enter a valid email address.'); $('#email').focus(); return; }
    if (!meter) { message($('#register-message'), 'Please enter your meter number.'); $('#meter-number').focus(); return; }
    if (password !== confirm) { message($('#register-message'), 'Your passwords do not match.'); $('#confirm-password').focus(); return; }
    const users = read(KEYS.users, []);
    if (users.some(u => u.email.toLowerCase() === email)) { message($('#register-message'), 'An account with this email already exists. Please log in.'); return; }
    if (users.some(u => u.meter === meter)) { message($('#register-message'), 'That meter number is already registered.'); return; }
    users.push({ name, email, phone, address: String(data.get('address') || '').trim(), meter, password, role: 'customer' });
    write(KEYS.users, users);
    const bills = read(KEYS.bills, []);
    bills.unshift({ id: 'BIL-' + Date.now(), email, meter, period: new Date().toLocaleString('en', { month: 'short', year: 'numeric' }), units: 0, due: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-GB'), amount: 0, status: 'No bill', created: today() });
    write(KEYS.bills, bills);
    message($('#register-message'), 'Account created. Taking you to login…', 'success');
    setTimeout(() => location.href = 'login.php', 700);
  });

  // ---------- Customer pages ----------
  function fillBill(bill) {
    $('#bill-period').textContent = bill.period;
    $('#bill-status').textContent = bill.status;
    $('#bill-units').textContent = `${bill.units} kWh`;
    $('#bill-due').textContent = bill.due;
    $('#bill-amount').textContent = money(bill.amount);
    const pay = $('#pay-now');
    if (pay) pay.href = `pay.php?bill=${encodeURIComponent(bill.id)}`;
    write(KEYS.selectedBill, bill.id);
  }

  if (PAGE === 'dashboard') {
    $('#customer-name').textContent = user.name;
    $('#customer-email').textContent = user.email;
    $('#customer-meter').textContent = user.meter;
    const latest = read(KEYS.bills, []).find(b => b.email === user.email && b.status !== 'Paid');
    if (latest) fillBill(latest);
    else { $('#bill-status').textContent = 'All bills paid'; $('#bill-amount').textContent = money(0); }

    const checkForm = $('#check-bill-form');
    checkForm.addEventListener('submit', async e => {
      e.preventDefault();
      const entered = $('#meter-number').value.trim();
      const error = $('#meter-error');
      error.hidden = true;
      if (!entered) { error.textContent = 'Enter your meter number.'; error.hidden = false; return; }
      const btn = $('button[type="submit"]', checkForm), old = btn.textContent;
      btn.disabled = true; btn.textContent = 'Checking…';
      await new Promise(r => setTimeout(r, 450));  // simulates an API call
      const owner = read(KEYS.users, []).find(u => u.meter === entered && u.role === 'customer');
      const bill = read(KEYS.bills, []).find(b => b.meter === entered && b.status !== 'Paid');
      if (!owner || owner.email !== user.email || !bill) {
        error.textContent = 'No unpaid bill was found for this meter number. Check the number and try again.';
        error.hidden = false;
      } else {
        fillBill(bill);
        $('#current-bill').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      btn.disabled = false; btn.textContent = old;
    });
  }

  if (PAGE === 'bills') {
    const own = read(KEYS.bills, []).filter(b => b.email === user.email);
    renderTable($('#rows'), own, [
      b => `<span class="strong">${safe(b.id)}</span>`,
      b => safe(b.period),
      b => `${safe(b.units)} kWh`,
      b => `<span class="amount-cell">${money(b.amount)}</span>`,
      b => safe(b.due),
      b => `<span class="badge ${b.status === 'Paid' ? 'badge--paid-green' : 'badge--pending'}">${safe(b.status)}</span>`
    ], 'No bills found for this account.');
  }

  if (PAGE === 'transactions') {
    const own = read(KEYS.payments, []).filter(p => p.email === user.email);
    renderTable($('#rows'), own, [
      p => `<span class="strong">${safe(p.id)}</span>`,
      p => safe(new Date(p.date).toLocaleDateString()),
      p => safe(p.billId),
      p => `<span class="amount-cell">${money(p.amount)}</span>`,
      p => safe(p.method === 'bank_transfer' ? 'Bank transfer' : 'Card'),
      p => `<span class="badge badge--paid-green">${safe(p.status)}</span>`,
      p => `<a class="btn btn--small" href="receipt.php" data-receipt="${safe(p.id)}">View receipt</a>`
    ], 'No transactions yet. Your completed payments will appear here.');
    const count = $('#record-count');
    if (count) count.textContent = `${own.length} record${own.length === 1 ? '' : 's'}`;
    $$('a[data-receipt]').forEach(a => a.addEventListener('click', () => {
      const p = own.find(x => x.id === a.dataset.receipt);
      if (p) write(KEYS.lastReceipt, p);
    }));
  }

  if (PAGE === 'pay') {
    const form = $('#payment-form');
    const submitBtn = $('.payment-submit', form);
    const bills = read(KEYS.bills, []);
    const selectedId = new URLSearchParams(location.search).get('bill') || read(KEYS.selectedBill, null);
    const bill = bills.find(b => b.id === selectedId && b.email === user.email && b.status !== 'Paid')
              || bills.find(b => b.email === user.email && b.status !== 'Paid');
    if (!bill) {
      message($('#payment-message'), 'There are no unpaid bills available for this account.');
      submitBtn.disabled = true;
    } else {
      $('#pay-bill-id').textContent = bill.id;
      $('#pay-amount').textContent = money(bill.amount);
      form.elements.bill_id.value = bill.id;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!bill || submitBtn.disabled) return;
      const label = $('.payment-submit__label', submitBtn), spinner = $('.payment-spinner', submitBtn);
      const error = $('#payment-message'), success = $('#payment-success');
      error.hidden = true;
      submitBtn.disabled = true; submitBtn.setAttribute('aria-busy', 'true');
      label.textContent = 'Processing payment'; spinner.hidden = false;

      setTimeout(() => {   // demo only: imitates a payment provider's wait
        try {
          const stamp = Date.now().toString().slice(-8);
          const method = $('input[name="payment_method"]:checked', form)?.value || 'card';
          const payment = { id: 'TXN-' + stamp, receipt: 'REC-' + stamp + '-GC', email: user.email, name: user.name, meter: user.meter, billId: bill.id, amount: bill.amount, method, status: 'Paid', date: today() };
          write(KEYS.payments, [payment, ...read(KEYS.payments, [])]);
          write(KEYS.bills, read(KEYS.bills, []).map(b => b.id === bill.id ? { ...b, status: 'Paid' } : b));
          write(KEYS.lastReceipt, payment);
          success.hidden = false;
          setTimeout(() => { location.href = ROOT + 'receipt.php'; }, 1250);
        } catch {
          message(error, 'The demo payment could not be saved. No receipt was created. Please try again.');
          submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy');
          label.textContent = 'Make Payment'; spinner.hidden = true;
        }
      }, 1100);
    });
  }

  if (PAGE === 'receipt') {
    const r = read(KEYS.lastReceipt, null);
    const main = $('main.panel');
    if (r && main) {
      const vals = $$('.receipt-amount strong, .receipt-list li span:last-child', main);
      const set = [money(r.amount), r.receipt, new Date(r.date).toLocaleString(), r.name, r.meter, r.billId, r.method === 'bank_transfer' ? 'Bank transfer' : 'Card'];
      vals.forEach((el, i) => { if (set[i] !== undefined) el.textContent = set[i]; });
    }
  }

  // ---------- Admin pages ----------
  const customers = () => read(KEYS.users, []).filter(u => u.role === 'customer');
  const payments = () => read(KEYS.payments, []);
  const bills = () => read(KEYS.bills, []);
  const nameFor = email => read(KEYS.users, []).find(u => u.email === email)?.name || '—';

  function bindSearch(render) {
    const input = $('#search');
    render();
    input?.addEventListener('input', render);
  }

  if (PAGE === 'admin-dashboard') {
    const stats = $$('.stat-value');
    const all = bills();
    stats[0].textContent = customers().length;
    stats[1].textContent = all.length;
    stats[2].textContent = money(payments().filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0));
    stats[3].textContent = money(all.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0));
    renderTable($('#rows'), payments().slice(0, 5), [
      p => `<span class="strong">${safe(p.id)}</span>`,
      p => `<span class="dark">${safe(p.name)}</span>`,
      p => safe(p.meter),
      p => `<span class="amount-cell">${money(p.amount)}</span>`,
      p => `<span class="badge badge--paid-green">${safe(p.status)}</span>`
    ], 'No payments yet.');
  }

  if (PAGE === 'admin-customers') {
    bindSearch(() => {
      const q = ($('#search')?.value || '').toLowerCase();
      const list = customers().filter(u => [u.name, u.email, u.meter, u.phone].join(' ').toLowerCase().includes(q));
      renderTable($('#rows'), list, [
        u => `<span class="dark">${safe(u.name)}</span>`,
        u => safe(u.email),
        u => safe(u.phone),
        u => `<span class="dark strong">${safe(u.meter)}</span>`
      ], 'No customers match your search.');
    });
  }

  if (PAGE === 'admin-bills') {
    bindSearch(() => {
      const q = ($('#search')?.value || '').toLowerCase();
      const list = bills().filter(b => [b.id, b.meter, b.status, b.period, nameFor(b.email)].join(' ').toLowerCase().includes(q));
      renderTable($('#rows'), list, [
        b => `<span class="link-cell">${safe(b.id)}</span>`,
        b => `<span class="dark">${safe(nameFor(b.email))}</span>`,
        b => safe(b.meter),
        b => safe(b.period),
        b => `<span class="amount-cell">${money(b.amount)}</span>`,
        b => `<span class="badge ${b.status === 'Paid' ? 'badge--paid' : 'badge--pending'}">${safe(b.status)}</span>`
      ], 'No bills match your search.');
    });
  }

  if (PAGE === 'admin-payments') {
    bindSearch(() => {
      const q = ($('#search')?.value || '').toLowerCase();
      const list = payments().filter(p => [p.id, p.name, p.meter, p.status].join(' ').toLowerCase().includes(q));
      renderTable($('#rows'), list, [
        p => `<span class="link-cell">${safe(p.id)}</span>`,
        p => `<span class="dark">${safe(p.name)}</span>`,
        p => safe(p.meter),
        p => `<span class="amount-cell">${money(p.amount)}</span>`,
        p => safe(new Date(p.date).toLocaleDateString()),
        p => `<span class="badge badge--paid-green">${safe(p.status)}</span>`
      ], 'No payments match your search.');
    });
  }

  // Responsive labels for any static table cells.
  $$('table').forEach(table => {
    const labels = $$('thead th', table).map(th => th.textContent.trim());
    $$('tbody tr', table).forEach(row => $$('td', row).forEach((cell, i) => {
      if (!cell.dataset.label && !cell.classList.contains('empty-state')) cell.dataset.label = labels[i] || `Detail ${i + 1}`;
    }));
  });
})();
