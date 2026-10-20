-- =====================================================================
-- Sample / test data only. No real customer data.
-- Run AFTER schema.sql.
--   Customer login:  amina.bello@example.ng / Password123!  (customers 2-4 use the same password)
--   Admin login:     admin@gridconnect.ng   / Admin123!
-- Hashes were made with PHP password_hash(..., PASSWORD_DEFAULT).
-- =====================================================================
USE electricity_billing;

INSERT INTO admins (name, email, password_hash) VALUES
  ('GridConnect Admin', 'admin@gridconnect.ng',
   '$2y$10$WPh0cbnJ.Fk6RhSQkS0rH.eaXht9A8.P3v/Lj1dDNc74IgsSRYsOm');

INSERT INTO customers (customer_id, name, email, phone, address, password_hash) VALUES
  (1, 'Amina Bello',      'amina.bello@example.ng', '08031234567', 'Ibadan, Oyo State',
   '$2y$10$ocR9LURdje88yDnhsuGLlePSSmx5lcIxIEDsPARl2E2f3PMqvwywa'),
  (2, 'Chukwuma Eze',     'c.eze@example.ng',       '08029876543', 'Lagos, Nigeria',
   '$2y$10$ocR9LURdje88yDnhsuGLlePSSmx5lcIxIEDsPARl2E2f3PMqvwywa'),
  (3, 'Fatima Yusuf',     'f.yusuf@example.ng',     '08145550192', 'Kano, Nigeria',
   '$2y$10$ocR9LURdje88yDnhsuGLlePSSmx5lcIxIEDsPARl2E2f3PMqvwywa'),
  (4, 'Olumide Adeyemi',  'o.adeyemi@example.ng',   '07012345678', 'Abeokuta, Ogun State',
   '$2y$10$ocR9LURdje88yDnhsuGLlePSSmx5lcIxIEDsPARl2E2f3PMqvwywa');

-- Customers 2-4 are extra test accounts; they use the same test password.

INSERT INTO accounts (customer_id, account_number) VALUES
  (1, 'ACC-0001'), (2, 'ACC-0002'), (3, 'ACC-0003'), (4, 'ACC-0004');

INSERT INTO meters (meter_id, customer_id, meter_number) VALUES
  (1, 1, '45012345678'),
  (2, 2, '45012345679'),
  (3, 3, '45012345680'),
  (4, 4, '45012345681');

INSERT INTO bills (bill_id, meter_id, billing_date, due_date, period_start, period_end, units_kwh, amount, bill_status) VALUES
  -- Amina: August (paid) and September (pending, shown on dashboard)
  (1, 1, '2026-08-31', '2026-09-15', '2026-08-01', '2026-08-31', 290.00, 16200.00, 'paid'),
  (2, 1, '2026-09-30', '2026-10-25', '2026-09-01', '2026-09-30', 325.00, 18450.00, 'pending'),
  -- Others (admin dashboard data)
  (3, 2, '2026-09-30', '2026-10-25', '2026-09-01', '2026-09-30', 240.00, 24700.00, 'paid'),
  (4, 3, '2026-09-30', '2026-10-25', '2026-09-01', '2026-09-30', 150.00, 12300.00, 'pending'),
  (5, 4, '2026-09-30', '2026-10-25', '2026-09-01', '2026-09-30', 410.00, 31150.00, 'paid');

INSERT INTO payments (payment_id, bill_id, amount, payment_date, payment_status, payment_method, gateway_transaction_id) VALUES
  (1, 1, 16200.00, '2026-09-14 10:05:00', 'success', 'card',          'GW-000001'),
  (2, 3, 24700.00, '2026-10-08 09:12:00', 'success', 'bank_transfer', 'GW-000002'),
  (3, 5, 31150.00, '2026-10-07 16:40:00', 'success', 'card',          'GW-000003'),
  (4, 4, 12300.00, '2026-10-06 11:20:00', 'failed',  'card',          'GW-000004');

INSERT INTO receipts (payment_id, receipt_number, issue_date) VALUES
  (1, 'REC-000001-GC', '2026-09-14 10:05:02'),
  (2, 'REC-000002-GC', '2026-10-08 09:12:03'),
  (3, 'REC-000003-GC', '2026-10-07 16:40:04');

INSERT INTO transactions (customer_id, payment_id, transaction_date, amount, status) VALUES
  (1, 1, '2026-09-14 10:05:00', 16200.00, 'success'),
  (2, 2, '2026-10-08 09:12:00', 24700.00, 'success'),
  (4, 3, '2026-10-07 16:40:00', 31150.00, 'success'),
  (3, 4, '2026-10-06 11:20:00', 12300.00, 'failed');
