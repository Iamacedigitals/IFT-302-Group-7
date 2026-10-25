/* GridConnect API client. Every call is async (fetch + async/await) and returns a Promise.
   Loaded before app.js on every page. Errors throw with err.status and err.message.
   Usage: const { bill } = await GridConnectApi.currentBill('45012345678'); */
(() => {
  'use strict';

  const inAdmin = location.pathname.includes('/public/admin/');
  const API_BASE = inAdmin ? '../../api/' : '../api/';
  const LOGIN_PAGE = inAdmin ? '../login.php' : 'login.php';

  async function request(path, { method = 'GET', body, query } = {}) {
    const url = new URL(API_BASE + path, location.href);
    if (query) url.search = new URLSearchParams(query).toString();

    const res = await fetch(url, {
      method,
      credentials: 'same-origin',                       // sends the PHP session cookie
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = { ok: false, message: 'Unexpected server response.' };
    }

    // Session expired: go to login, unless this request was the login itself.
    if (res.status === 401 && !location.pathname.endsWith('/login.php')) {
      location.href = LOGIN_PAGE;
    }
    if (!res.ok || !data.ok) {
      const err = new Error(data.message || 'Request failed.');
      err.status = res.status;
      throw err;
    }
    return data;
  }

  window.GridConnectApi = {
    // Accounts
    register:      (form)                  => request('customers/register.php', { method: 'POST', body: form }),
    login:         (email, password)       => request('auth/login.php', { method: 'POST', body: { email, password } }),
    logout:        ()                      => request('auth/logout.php', { method: 'POST' }),
    me:            ()                      => request('auth/me.php'),

    // Customer
    currentBill:   (meter)                 => request('bills/current.php', { query: meter ? { meter } : undefined }),
    bills:         ()                      => request('bills/history.php'),
    transactions:  ()                      => request('transactions/history.php'),
    pay:           (billId, paymentMethod) => request('payments/create.php', { method: 'POST', body: { bill_id: billId, payment_method: paymentMethod } }),
    receipt:       (paymentId)             => request('payments/receipt.php', { query: { id: paymentId } }),

    // Admin
    adminStats:    ()                      => request('admin/stats.php'),
    adminCustomers:(q = '')                => request('admin/customers.php', { query: { q } }),
    adminBills:    (q = '')                => request('admin/bills.php', { query: { q } }),
    adminPayments: (q = '')                => request('admin/payments.php', { query: { q } }),
  };
})();
