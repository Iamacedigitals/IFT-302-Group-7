/* GridConnect page logic. Data comes from the PHP API through window.GridConnectApi (api.js).
   Nothing is stored in the browser. Page access is enforced on the server (includes/header.php). */
(() => {
  'use strict';

  const body = document.body;
  const ROOT = body.dataset.root || '';   // '' in public/, '../' in public/admin/
  const PAGE = body.dataset.page || '';
  const api = window.GridConnectApi;

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const money = n => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(n) || 0);
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const initials = name => (name || 'U').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();

  // MySQL and PostgreSQL send dates as "2026-10-25" or "2026-10-25 14:32:00". Safari needs the "T" form.
  const toDate = s => new Date(String(s).length === 10 ? s + 'T00:00:00' : String(s).replace(' ', 'T'));
  const dateShort = s => toDate(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const period = (start, end) => `${dateShort(start)} – ${dateShort(end)}`;
  const billId = id => `BIL-${String(id).padStart(6, '0')}`;
  const txnId = id => `TXN-${String(id).padStart(6, '0')}`;

  const STATUS_TEXT = { pending: 'Pending', paid: 'Paid', overdue: 'Overdue', success: 'Paid', failed: 'Failed' };
  const badge = status => {
    const cls = status === 'paid' || status === 'success' ? 'badge--paid-green'
              : status === 'failed' ? 'badge--failed' : 'badge--pending';
    return `<span class="badge ${cls}">${safe(STATUS_TEXT[status] || status)}</span>`;
  };

  function message(el, text, type = 'error') {
    if (!el) return;
    el.textContent = text; el.hidden = false;
    el.classList.remove('form-message--error', 'form-message--success');
    el.classList.add(type === 'success' ? 'form-message--success' : 'form-message--error');
  }

  // Button text is restored from its original label when busy ends.
  function setBusy(btn, busy, text) {
    if (!btn) return;
    if (busy && !btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.disabled = busy;
    btn.textContent = busy ? text : (btn.dataset.label || text);
  }

  function renderTable(tbody, rows, columns, emptyText) {
    if (!tbody) return;
    const labels = $$('thead th', tbody.closest('table')).map(th => th.textContent.trim());
    tbody.innerHTML = rows.length
      ? rows.map(row => '<tr>' + columns.map((col, i) => `<td data-label="${safe(labels[i] || `Detail ${i + 1}`)}">${col(row)}</td>`).join('') + '</tr>').join('')
      : `<tr><td colspan="${columns.length}" class="empty-state">${safe(emptyText)}</td></tr>`;
  }

  // ---------- Shared UI: mobile menu, placeholder links, search forms ----------
  const menuToggle = $('.mobile-menu-toggle');
  const sidebar = $('.sidebar');
  const backdrop = $('.sidebar-backdrop');
  function closeMenu() { document.body.classList.remove('menu-open'); menuToggle?.setAttribute('aria-expanded', 'false'); menuToggle?.setAttribute('aria-label', 'Open navigation menu'); }
  function openMenu() { document.body.classList.add('menu-open'); menuToggle?.setAttribute('aria-expanded', 'true'); menuToggle?.setAttribute('aria-label', 'Close navigation menu'); }
  menuToggle?.addEventListener('click', () => document.body.classList.contains('menu-open') ? closeMenu() : openMenu());
  backdrop?.addEventListener('click', closeMenu);
  sidebar?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  $$('form.search').forEach(form => form.addEventListener('submit', e => e.preventDefault()));
  $$('a[href="#"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const tr = a.closest('tr');
    if (tr) tr.classList.toggle('row-highlight');
    else message($('.page-head'), 'This action is not available yet.', 'success');
  }));

  // ---------- Header identity ----------
  async function loadUser() {
    try {
      const me = await api.me();
      const nameEl = $('.user-name');
      if (nameEl) nameEl.textContent = me.role === 'admin' ? 'Administrator' : me.name;
      const avatar = $('.user-avatar');
      if (avatar) avatar.textContent = me.role === 'admin' ? 'AD' : initials(me.name);
      return me;
    } catch {
      return null;   // api.js already redirects to login on 401
    }
  }

  // ---------- Login ----------
  const loginForm = $('#login-form');
  if (loginForm) loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('button[type="submit"]', loginForm);
    setBusy(btn, true, 'Logging in…');
    try {
      const res = await api.login($('#email').value.trim(), $('#password').value);
      location.href = res.role === 'admin' ? 'admin/dashboard.php' : 'dashboard.php';
    } catch (err) {
      message($('#login-message'), err.message);
      setBusy(btn, false, 'Log in');
    }
  });

  // ---------- Register ----------
  const registerForm = $('#register-form');
  if (registerForm) registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const data = new FormData(registerForm);
    const errEl = $('#register-message');
    const password = String(data.get('password') || '');
    if (password !== String(data.get('confirm_password') || '')) {
      message(errEl, 'Your passwords do not match.');
      $('#confirm-password').focus();
      return;
    }
    const btn = $('button[type="submit"]', registerForm);
    setBusy(btn, true, 'Creating account…');
    try {
      await api.register({
        full_name: String(data.get('full_name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        phone: String(data.get('phone') || '').trim(),
        address: String(data.get('address') || '').trim(),
        meter_number: String(data.get('meter_number') || '').trim(),
        password,
      });
      message(errEl, 'Account created. Taking you to login…', 'success');
      setTimeout(() => { location.href = 'login.php'; }, 700);
    } catch (err) {
      message(errEl, err.message);
      setBusy(btn, false, 'Create account');
    }
  });

  // ---------- Customer: dashboard ----------
  function fillBill(bill) {
    $('#bill-period').textContent = period(bill.period_start, bill.period_end);
    const status = $('#bill-status');
    status.textContent = STATUS_TEXT[bill.bill_status] || bill.bill_status;
    status.className = 'badge ' + (bill.bill_status === 'paid' ? 'badge--paid-green' : 'badge--pending');
    $('#bill-units').textContent = `${Number(bill.units_kwh)} kWh`;
    $('#bill-due').textContent = dateShort(bill.due_date);
    $('#bill-amount').textContent = money(bill.amount);
    const pay = $('#pay-now');
    if (pay) pay.href = `pay.php?bill=${encodeURIComponent(bill.bill_id)}`;
  }

  async function initDashboard(me) {
    $('#customer-name').textContent = me.name;
    $('#customer-email').textContent = me.email;
    $('#customer-meter').textContent = me.meter || '—';

    try {
      const { bill } = await api.currentBill();
      fillBill(bill);
    } catch (err) {
      if (err.status === 404) {
        $('#bill-status').textContent = 'All bills paid';
        $('#bill-amount').textContent = money(0);
      } else {
        $('#bill-status').textContent = 'Could not load bill';
      }
    }

    const checkForm = $('#check-bill-form');
    checkForm.addEventListener('submit', async e => {
      e.preventDefault();
      const entered = $('#meter-number').value.trim();
      const error = $('#meter-error');
      error.hidden = true;
      if (!entered) { error.textContent = 'Enter your meter number.'; error.hidden = false; return; }
      const btn = $('button[type="submit"]', checkForm);
      setBusy(btn, true, 'Checking…');
      try {
        const { bill } = await api.currentBill(entered);
        fillBill(bill);
        $('#current-bill').scrollIntoView({ behavior: 'smooth', block: 'start' });
      } catch (err) {
        error.textContent = err.status === 404
          ? 'No unpaid bill was found for this meter number. Check the number and try again.'
          : err.message;
        error.hidden = false;
      } finally {
        setBusy(btn, false, 'Get bill');
      }
    });
  }

  // ---------- Customer: previous bills, transactions, payment, receipt ----------
  async function initBills() {
    const { bills } = await api.bills();
    renderTable($('#rows'), bills, [
      b => `<span class="strong">${safe(billId(b.bill_id))}</span>`,
      b => safe(period(b.period_start, b.period_end)),
      b => `${safe(Number(b.units_kwh))} kWh`,
      b => `<span class="amount-cell">${money(b.amount)}</span>`,
      b => safe(dateShort(b.due_date)),
      b => badge(b.bill_status),
    ], 'No bills found for this account.');
  }

  async function initTransactions() {
    const { transactions } = await api.transactions();
    renderTable($('#rows'), transactions, [
      t => `<span class="strong">${safe(txnId(t.payment_id))}</span>`,
      t => safe(dateShort(t.transaction_date)),
      t => safe(period(t.period_start, t.period_end)),
      t => `<span class="amount-cell">${money(t.amount)}</span>`,
      t => safe(t.payment_method === 'bank_transfer' ? 'Bank transfer' : 'Card'),
      t => badge(t.status),
      t => t.receipt_number ? `<a class="btn btn--small" href="receipt.php?id=${encodeURIComponent(t.payment_id)}">View receipt</a>` : '—',
    ], 'No transactions yet. Your completed payments will appear here.');
    const count = $('#record-count');
    if (count) count.textContent = `${transactions.length} record${transactions.length === 1 ? '' : 's'}`;
  }

  async function initPay() {
    const form = $('#payment-form');
    const submitBtn = $('.payment-submit', form);
    const error = $('#payment-message');
    const requested = Number(new URLSearchParams(location.search).get('bill')) || null;

    let bill = null;
    try {
      const { bills } = await api.bills();
      const open = bills.filter(b => b.bill_status !== 'paid');
      bill = open.find(b => Number(b.bill_id) === requested) || open[0] || null;
    } catch (err) {
      message(error, err.message);
    }
    if (!bill) {
      message(error, 'There are no unpaid bills available for this account.');
      submitBtn.disabled = true;
      return;
    }
    $('#pay-bill-id').textContent = billId(bill.bill_id);
    $('#pay-amount').textContent = money(bill.amount);
    if (form.elements.bill_id) form.elements.bill_id.value = bill.bill_id;

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (submitBtn.disabled) return;
      const label = $('.payment-submit__label', submitBtn);
      const spinner = $('.payment-spinner', submitBtn);
      const success = $('#payment-success');
      const method = $('input[name="payment_method"]:checked', form)?.value || 'card';
      error.hidden = true;
      submitBtn.disabled = true; submitBtn.setAttribute('aria-busy', 'true');
      label.textContent = 'Processing payment'; spinner.hidden = false;
      try {
        const res = await api.pay(Number(bill.bill_id), method);
        success.hidden = false;
        setTimeout(() => { location.href = `receipt.php?id=${encodeURIComponent(res.payment_id)}`; }, 1250);
      } catch (err) {
        message(error, err.message);
        submitBtn.disabled = false; submitBtn.removeAttribute('aria-busy');
        label.textContent = 'Make Payment'; spinner.hidden = true;
      }
    });
  }

  async function initReceipt() {
    const main = $('main.panel');
    const id = new URLSearchParams(location.search).get('id');
    try {
      const { receipt: r } = await api.receipt(id);
      const vals = $$('.receipt-amount strong, .receipt-list li span:last-child', main);
      const values = [
        money(r.amount),
        r.receipt_number,
        toDate(r.issue_date).toLocaleString('en-GB'),
        r.customer_name,
        r.meter_number,
        period(r.period_start, r.period_end),
        r.payment_method === 'bank_transfer' ? 'Bank transfer' : 'Card',
      ];
      vals.forEach((el, i) => { if (values[i] !== undefined) el.textContent = values[i]; });
    } catch (err) {
      if (main) main.insertAdjacentHTML('afterbegin', `<p class="form-message form-message--error">${safe(err.message)}</p>`);
    }
  }

  // ---------- Admin ----------
  function bindSearch(load) {
    const input = $('#search');
    let timer;
    const run = () => load(input?.value.trim() || '').catch(err => message($('.page-head') || main(), err.message));
    input?.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(run, 250); });
    return run();
  }
  const main = () => $('main') || body;

  async function initAdminDashboard() {
    const { stats: s } = await api.adminStats();
    const values = $$('.stat-value');
    values[0].textContent = s.total_customers;
    values[1].textContent = s.total_bills;
    values[2].textContent = money(s.payments_received);
    values[3].textContent = money(s.pending_amount);

    const { payments } = await api.adminPayments();
    renderTable($('#rows'), payments.slice(0, 5), [
      p => `<span class="strong">${safe(txnId(p.payment_id))}</span>`,
      p => `<span class="dark">${safe(p.customer_name)}</span>`,
      p => safe(p.meter_number),
      p => `<span class="amount-cell">${money(p.amount)}</span>`,
      p => badge(p.payment_status),
    ], 'No payments yet.');
  }

  function initAdminCustomers() {
    return bindSearch(async q => {
      const { customers } = await api.adminCustomers(q);
      renderTable($('#rows'), customers, [
        c => `<span class="dark">${safe(c.name)}</span>`,
        c => safe(c.email),
        c => safe(c.phone),
        c => `<span class="dark strong">${safe(c.meter_number)}</span>`,
      ], 'No customers match your search.');
    });
  }

  function initAdminBills() {
    return bindSearch(async q => {
      const { bills } = await api.adminBills(q);
      renderTable($('#rows'), bills, [
        b => `<span class="link-cell">${safe(billId(b.bill_id))}</span>`,
        b => `<span class="dark">${safe(b.customer_name)}</span>`,
        b => safe(b.meter_number),
        b => safe(period(b.period_start, b.period_end)),
        b => `<span class="amount-cell">${money(b.amount)}</span>`,
        b => badge(b.bill_status),
      ], 'No bills match your search.');
    });
  }

  function initAdminPayments() {
    return bindSearch(async q => {
      const { payments } = await api.adminPayments(q);
      renderTable($('#rows'), payments, [
        p => `<span class="link-cell">${safe(txnId(p.payment_id))}</span>`,
        p => `<span class="dark">${safe(p.customer_name)}</span>`,
        p => safe(p.meter_number),
        p => `<span class="amount-cell">${money(p.amount)}</span>`,
        p => safe(dateShort(p.payment_date)),
        p => badge(p.payment_status),
      ], 'No payments match your search.');
    });
  }

  // ---------- Start the page ----------
  // Login and register only need their forms (wired above). Other pages load the signed-in user first.
  const PAGE_INIT = {
    dashboard: initDashboard,
    bills: initBills,
    transactions: initTransactions,
    pay: initPay,
    receipt: initReceipt,
    'admin-dashboard': initAdminDashboard,
    'admin-customers': initAdminCustomers,
    'admin-bills': initAdminBills,
    'admin-payments': initAdminPayments,
  };
  const init = PAGE_INIT[PAGE];
  if (init) {
    loadUser()
      .then(me => me && init(me))
      .catch(err => message($('.page-head') || main(), err.message));
  }

  // Responsive labels for any static table cells.
  $$('table').forEach(table => {
    const labels = $$('thead th', table).map(th => th.textContent.trim());
    $$('tbody tr', table).forEach(row => $$('td', row).forEach((cell, i) => {
      if (!cell.dataset.label && !cell.classList.contains('empty-state')) cell.dataset.label = labels[i] || `Detail ${i + 1}`;
    }));
  });
})();
