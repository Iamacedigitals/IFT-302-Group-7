<?php
// Session helpers: start the session, check who is logged in, and guard API endpoints.
// Owner: David

require_once __DIR__ . '/response.php';

function start_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'httponly' => true,
            'samesite' => 'Lax',
            'secure'   => !empty($_SERVER['HTTPS']),
        ]);
        session_start();
    }
}

function current_customer_id(): ?int
{
    start_session();
    return isset($_SESSION['customer_id']) ? (int) $_SESSION['customer_id'] : null;
}

function current_admin_id(): ?int
{
    start_session();
    return isset($_SESSION['admin_id']) ? (int) $_SESSION['admin_id'] : null;
}

// For API endpoints: returns the logged-in customer_id, or stops with 401.
function require_customer(): int
{
    $id = current_customer_id();
    if (!$id) {
        json_out(['ok' => false, 'message' => 'Please log in first.'], 401);
    }
    return $id;
}

// For API endpoints: returns the logged-in admin_id, or stops with 401.
function require_admin(): int
{
    $id = current_admin_id();
    if (!$id) {
        json_out(['ok' => false, 'message' => 'Admin login required.'], 401);
    }
    return $id;
}
