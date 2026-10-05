# Online Electricity Bill Payment Platform (Group 7)

Web platform where customers check electricity bills and pay online.
**Stack:** HTML, CSS, JavaScript (fetch/async), PHP (OOP), MySQL.

## Features
Customer registration, meter number, customer account, current bill, previous bills,
payment, payment receipt, transaction history, payment status, admin dashboard.

## Structure
```
docs/         requirements, diagrams (use-case, activity, erd), API docs
database/     schema.sql, seeds.sql, migrations/
config/       config.example.php (copy to config.php locally)
src/          OOP classes (Customer, Meter, Bill, Payment, Database) + helpers
api/          PHP JSON endpoints called by JavaScript fetch()
includes/     shared header/footer partials
public/       web root: pages, admin/, assets/ (css, js, img)
tests/        tests
```

## Setup
1. Install XAMPP/WAMP/Laragon and place this folder in `htdocs`.
2. Import `database/schema.sql` then `database/seeds.sql` in phpMyAdmin.
3. Copy `config/config.example.php` to `config/config.php` and edit DB details.
4. Open `http://localhost/electricity-bill-platform/public/`.

## Team
See `CONTRIBUTING.md` for workflow and task ownership.
