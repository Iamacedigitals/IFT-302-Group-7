<?php
// JSON helpers for API endpoints.
// Owner: David

function json_out(array $data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

// Reads a JSON request body. Returns [] if the body is missing or invalid.
function json_in(): array
{
    $data = json_decode(file_get_contents('php://input') ?: '[]', true);
    return is_array($data) ? $data : [];
}
