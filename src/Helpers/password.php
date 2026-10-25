<?php
// Password helpers. New passwords are hashed with Argon2id (falls back to PHP's default if PHP lacks Argon2).
// Old bcrypt hashes still verify and are upgraded to Argon2id on the next successful login.
// Owner: David

define('GC_PASSWORD_OPTIONS', ['memory_cost' => 65536, 'time_cost' => 4, 'threads' => 1]);

function password_algorithm(): string|int
{
    return in_array('argon2id', password_algos(), true) ? PASSWORD_ARGON2ID : PASSWORD_DEFAULT;
}

// Returns the full hash string (algorithm, parameters and salt included). Store it as-is.
function hash_password(string $password): string
{
    return password_hash($password, password_algorithm(), GC_PASSWORD_OPTIONS);
}

function verify_password(string $password, string $hash): bool
{
    return password_verify($password, $hash);
}

function password_needs_upgrade(string $hash): bool
{
    return password_needs_rehash($hash, password_algorithm(), GC_PASSWORD_OPTIONS);
}
