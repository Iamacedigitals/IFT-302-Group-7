-- =====================================================================
-- Electricity Bill Payment Platform (GridConnect): MySQL schema
-- Source of truth for the database. Matches the ERD in docs/diagrams/erd/.
-- Target: MySQL 8.0.16+ (CHECK constraints). Engine InnoDB, utf8mb4.
-- Keep the Supabase/PostgreSQL copy in database/supabase/ in sync.
-- =====================================================================

CREATE DATABASE IF NOT EXISTS electricity_billing
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE electricity_billing;

SET NAMES utf8mb4;

-- Drop in reverse dependency order so the script can be re-run during development.
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS receipts;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS meters;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS admins;

-- ---------------------------------------------------------------------
-- Customers (registered users). Login uses email + password_hash.
-- The register form posts "full_name"; stored here as "name".
-- ---------------------------------------------------------------------
CREATE TABLE customers (
  customer_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  phone         CHAR(11)     NOT NULL,
  address       VARCHAR(255) NULL,
  password_hash VARCHAR(255) NOT NULL,        -- from password_hash(); never plain text
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id),
  UNIQUE KEY uq_customers_email (email),
  CONSTRAINT chk_customers_phone CHECK (phone REGEXP '^0[789][0-9]{9}$')
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Admins (back-office staff). Separate from customers, as in the ERD.
-- ---------------------------------------------------------------------
CREATE TABLE admins (
  admin_id      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  PRIMARY KEY (admin_id),
  UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Accounts: the utility account owned by a customer (ERD: ACCOUNT).
-- ---------------------------------------------------------------------
CREATE TABLE accounts (
  account_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id    INT UNSIGNED NOT NULL,
  account_number VARCHAR(20)  NOT NULL,
  account_status ENUM('active', 'suspended', 'closed') NOT NULL DEFAULT 'active',
  PRIMARY KEY (account_id),
  UNIQUE KEY uq_accounts_number (account_number),
  CONSTRAINT fk_accounts_customer FOREIGN KEY (customer_id)
    REFERENCES customers (customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Meters. The customer looks up bills by meter number.
-- ---------------------------------------------------------------------
CREATE TABLE meters (
  meter_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id  INT UNSIGNED NOT NULL,
  meter_number VARCHAR(20)  NOT NULL,
  PRIMARY KEY (meter_id),
  UNIQUE KEY uq_meters_number (meter_number),
  CONSTRAINT fk_meters_customer FOREIGN KEY (customer_id)
    REFERENCES customers (customer_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Bills. period_start, period_end and units_kwh are NOT in the original
-- ERD; the pages display them, so they were added.
-- ---------------------------------------------------------------------
CREATE TABLE bills (
  bill_id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  meter_id      INT UNSIGNED NOT NULL,
  billing_date  DATE          NOT NULL,
  due_date      DATE          NOT NULL,
  period_start  DATE          NOT NULL,
  period_end    DATE          NOT NULL,
  units_kwh     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  amount        DECIMAL(12,2) NOT NULL,
  bill_status   ENUM('pending', 'paid', 'overdue') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (bill_id),
  KEY idx_bills_meter_status (meter_id, bill_status),
  CONSTRAINT fk_bills_meter FOREIGN KEY (meter_id)
    REFERENCES meters (meter_id) ON DELETE CASCADE,
  CONSTRAINT chk_bills_amount CHECK (amount >= 0),
  CONSTRAINT chk_bills_units  CHECK (units_kwh >= 0),
  CONSTRAINT chk_bills_period CHECK (period_end >= period_start)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Payments: one row per payment attempt against a bill (ERD: PAYMENT).
-- gateway_transaction_id is the ERD's transaction_id, renamed so it does
-- not clash with TRANSACTION.transaction_id.
-- ---------------------------------------------------------------------
CREATE TABLE payments (
  payment_id             INT UNSIGNED NOT NULL AUTO_INCREMENT,
  bill_id                INT UNSIGNED NOT NULL,
  amount                 DECIMAL(12,2) NOT NULL,
  payment_date           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payment_status         ENUM('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
  payment_method         ENUM('card', 'bank_transfer') NOT NULL,
  gateway_transaction_id VARCHAR(40)   NULL,   -- ID from the simulated gateway
  PRIMARY KEY (payment_id),
  UNIQUE KEY uq_payments_gateway (gateway_transaction_id),
  KEY idx_payments_bill (bill_id),
  KEY idx_payments_status_date (payment_status, payment_date),
  CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id)
    REFERENCES bills (bill_id) ON DELETE RESTRICT,
  CONSTRAINT chk_payments_amount CHECK (amount >= 0)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Receipts: one receipt per successful payment (ERD: RECEIPT).
-- ---------------------------------------------------------------------
CREATE TABLE receipts (
  receipt_id     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  payment_id     INT UNSIGNED NOT NULL,
  receipt_number VARCHAR(30)  NOT NULL,
  issue_date     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (receipt_id),
  UNIQUE KEY uq_receipts_payment (payment_id),
  UNIQUE KEY uq_receipts_number (receipt_number),
  CONSTRAINT fk_receipts_payment FOREIGN KEY (payment_id)
    REFERENCES payments (payment_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Transactions: the customer-facing history row for a payment (ERD: TRANSACTION).
-- ---------------------------------------------------------------------
CREATE TABLE transactions (
  transaction_id   INT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id      INT UNSIGNED NOT NULL,
  payment_id       INT UNSIGNED NOT NULL,
  transaction_date DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount           DECIMAL(12,2) NOT NULL,
  status           ENUM('pending', 'success', 'failed') NOT NULL,
  PRIMARY KEY (transaction_id),
  KEY idx_transactions_customer_date (customer_id, transaction_date),
  KEY idx_transactions_payment (payment_id),
  CONSTRAINT fk_transactions_customer FOREIGN KEY (customer_id)
    REFERENCES customers (customer_id) ON DELETE RESTRICT,
  CONSTRAINT fk_transactions_payment FOREIGN KEY (payment_id)
    REFERENCES payments (payment_id) ON DELETE RESTRICT,
  CONSTRAINT chk_transactions_amount CHECK (amount >= 0)
) ENGINE=InnoDB;
