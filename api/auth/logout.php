<?php
// API: POST /api/auth/logout.php
// Owner: David
require_once __DIR__ . '/../../src/Helpers/response.php';
require_once __DIR__ . '/../../src/Helpers/session.php';

start_session();
$_SESSION = [];
session_destroy();
json_out(['ok' => true]);
