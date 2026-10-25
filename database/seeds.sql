-- =====================================================================
-- GridConnect: sample / test data for Supabase (PostgreSQL)
-- Same data as database/seeds.sql (MySQL).
--
-- Run AFTER database/supabase/schema.sql, in the Supabase SQL Editor.
-- Safe to re-run: it empties the tables and loads the data again.
--
--   Customer login:  amina.bello@example.ng / Password123!
--                    (customers 2-4 use the same password)
--   Admin login:     admin@gridconnect.ng   / Admin123!
-- =====================================================================

begin;

-- Empty every table and reset the id counters (cascades through foreign keys).
--truncate table transactions, receipts, payments, bills, meters, accounts, customers, admins
--  restart identity cascade;

-- ---------------------------------------------------------------------
-- Admins
-- ---------------------------------------------------------------------
insert into admins (name, email, password_hash) values
  ('GridConnect Admin', 'admin@gridconnect.ng',
   '$2y$10$WPh0cbnJ.Fk6RhSQkS0rH.eaXht9A8.P3v/Lj1dDNc74IgsSRYsOm');

-- ---------------------------------------------------------------------
-- Customers (password for all four: Password123!)
-- ---------------------------------------------------------------------
insert into customers (customer_id, name, email, phone, address, password_hash) values
  (1, 'Amina Bello',     'amina.bello@example.ng', '08031234567', 'Ibadan, Oyo State',
   '$2y$10$ocR9LURdje88yDnhsuGLlePSSmx5lcIxIEDsPARl2E2f3PMqvwywa'),
  (2, 'Chukwuma Eze',    'c.eze@example.ng',       '08029876543', 'Lagos, Nigeria',
   '$2y$10$ocR9LURdje88yDnhsuGLlePSSmx5lcIxIEDsPARl2E2f3PMqvwywa'),
  (3, 'Fatima Yusuf',    'f.yusuf@example.ng',     '08145550192', 'Kano, Nigeria',
   '$2y$10$ocR9LURdje88yDnhsuGLlePSSmx5lcIxIEDsPARl2E2f3PMqvwywa'),
  (4, 'Olumide Adeyemi', 'o.adeyemi@example.ng',   '07012345678', 'Abeokuta, Ogun State',
   '$2y$10$ocR9LURdje88yDnhsuGLlePSSmx5lcIxIEDsPARl2E2f3PMqvwywa');

insert into accounts (customer_id, account_number) values
  (1, 'ACC-0001'), (2, 'ACC-0002'), (3, 'ACC-0003'), (4, 'ACC-0004');

insert into meters (meter_id, customer_id, meter_number) values
  (1, 1, '45012345678'),
  (2, 2, '45012345679'),
  (3, 3, '45012345680'),
  (4, 4, '45012345681');

-- ---------------------------------------------------------------------
-- Bills: Amina has August (paid) and September (pending, shown on dashboard)
-- ---------------------------------------------------------------------
insert into bills (bill_id, meter_id, billing_date, due_date, period_start, period_end,
                   units_kwh, amount, bill_status) values
  (1, 1, '2026-08-31', '2026-09-15', '2026-08-01', '2026-08-31', 290.00, 16200.00, 'paid'),
  (2, 1, '2026-09-30', '2026-10-25', '2026-09-01', '2026-09-30', 325.00, 18450.00, 'pending'),
  (3, 2, '2026-09-30', '2026-10-25', '2026-09-01', '2026-09-30', 240.00, 24700.00, 'paid'),
  (4, 3, '2026-09-30', '2026-10-25', '2026-09-01', '2026-09-30', 150.00, 12300.00, 'pending'),
  (5, 4, '2026-09-30', '2026-10-25', '2026-09-01', '2026-09-30', 410.00, 31150.00, 'paid');

-- ---------------------------------------------------------------------
-- Payments, receipts and transaction history
-- ---------------------------------------------------------------------
insert into payments (payment_id, bill_id, amount, payment_date, payment_status,
                      payment_method, gateway_transaction_id) values
  (1, 1, 16200.00, '2026-09-14 10:05:00+01', 'success', 'card',          'GW-000001'),
  (2, 3, 24700.00, '2026-10-08 09:12:00+01', 'success', 'bank_transfer', 'GW-000002'),
  (3, 5, 31150.00, '2026-10-07 16:40:00+01', 'success', 'card',          'GW-000003'),
  (4, 4, 12300.00, '2026-10-06 11:20:00+01', 'failed',  'card',          'GW-000004');

insert into receipts (payment_id, receipt_number, issue_date) values
  (1, 'REC-000001-GC', '2026-09-14 10:05:02+01'),
  (2, 'REC-000002-GC', '2026-10-08 09:12:03+01'),
  (3, 'REC-000003-GC', '2026-10-07 16:40:04+01');

insert into transactions (customer_id, payment_id, transaction_date, amount, status) values
  (1, 1, '2026-09-14 10:05:00+01', 16200.00, 'success'),
  (2, 2, '2026-10-08 09:12:00+01', 24700.00, 'success'),
  (4, 3, '2026-10-07 16:40:00+01', 31150.00, 'success'),
  (3, 4, '2026-10-06 11:20:00+01', 12300.00, 'failed');

-- ---------------------------------------------------------------------
-- Rows above used explicit ids, so move each id counter past them.
-- Without this, the next insert from the app would fail with a duplicate id.
-- ---------------------------------------------------------------------
select setval(pg_get_serial_sequence('admins', 'admin_id'), (select coalesce(max(admin_id), 1) from admins));
select setval(pg_get_serial_sequence('customers', 'customer_id'), (select coalesce(max(customer_id), 1) from customers));
select setval(pg_get_serial_sequence('accounts', 'account_id'), (select coalesce(max(account_id), 1) from accounts));
select setval(pg_get_serial_sequence('meters', 'meter_id'), (select coalesce(max(meter_id), 1) from meters));
select setval(pg_get_serial_sequence('bills', 'bill_id'), (select coalesce(max(bill_id), 1) from bills));
select setval(pg_get_serial_sequence('payments', 'payment_id'), (select coalesce(max(payment_id), 1) from payments));
select setval(pg_get_serial_sequence('receipts', 'receipt_id'), (select coalesce(max(receipt_id), 1) from receipts));
select setval(pg_get_serial_sequence('transactions', 'transaction_id'), (select coalesce(max(transaction_id), 1) from transactions));

commit;
