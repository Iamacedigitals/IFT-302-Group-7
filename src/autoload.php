<?php
// Autoloader: loads src/Classes/<ClassName>.php on first use.
spl_autoload_register(function (string $class): void {
    $file = __DIR__ . '/Classes/' . $class . '.php';
    if (is_file($file)) {
        require_once $file;
    }
});

require_once __DIR__ . '/Helpers/password.php';
