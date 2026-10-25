<?php
// Input validation helpers. Rules match the database CHECK constraints.
// Owner: David

function is_valid_email(string $email): bool
{
    return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Nigerian mobile: 11 digits, starting 070-079, 080-089 or 090-099.
function is_valid_phone(string $phone): bool
{
    return (bool) preg_match('/^0[789][0-9]{9}$/', $phone);
}

function is_valid_meter(string $meter): bool
{
    return (bool) preg_match('/^\d{6,20}$/', $meter);
}
