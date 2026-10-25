# Changes in this package and steps to finish

## Changed files (copy over the repo, same paths)
- src/Helpers/password.php (NEW): Argon2id hashing, verify, upgrade check
- src/autoload.php: loads password.php
- src/Classes/Customer.php: register uses hash_password(); login verifies and upgrades old hashes
- src/Classes/Admin.php: login verifies and upgrades old hashes
- src/Classes/Payment.php: pay() locks the bill (FOR UPDATE) inside the transaction, fixing double payment; new statusForCustomer()
- src/Classes/Meter.php: new findForCustomer()
- api/meters/lookup.php (was an empty stub): GET ?meter= checks the meter belongs to the logged-in customer
- api/payments/status.php (was an empty stub): GET ?id= returns one of the customer's payments

No database changes are needed. The password_hash column (VARCHAR 255) fits Argon2id hashes (about 97 chars).
Existing seed accounts still log in with their bcrypt hashes and are upgraded to Argon2id on first login.

## Steps
1. Back up your current project folder.
2. Copy the files above into your project, overwriting the originals. Keep your config/config.php.
3. Check that PHP supports Argon2id (XAMPP/Laragon PHP usually does):
   php -r "var_dump(in_array('argon2id', password_algos(), true));"
   Should print bool(true). If false, the code falls back to PHP's default hash, which is still safe.
4. Make sure the database has the seed data loaded (MySQL: schema.sql then seeds.sql; Supabase: supabase/schema.sql then supabase/seeds.sql).
5. Test login:
   - Customer: amina.bello@example.ng / Password123!
   - Admin: admin@gridconnect.ng / Admin123!
6. Test register with a new email, new 11-digit phone and an unused meter number. Then log out and log in with the new account.
7. Test payment: pay a pending bill, then check the transaction history and receipt.
8. Test the two new endpoints while logged in:
   - /api/meters/lookup.php?meter=45012345678 (should succeed for Amina)
   - /api/payments/status.php?id=1
9. Optional check in your database: the customers password_hash for a newly registered user should start with $argon2id$.
