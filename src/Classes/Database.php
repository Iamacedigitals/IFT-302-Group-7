<?php
// PDO connection wrapper (singleton). One shared connection per request.
// Driver is set in config/config.php: 'mysql' (team target) or 'pgsql' (Supabase, for now).
// Owner: David

class Database
{
    private static ?PDO $pdo = null;

    public static function connection(): PDO
    {
        if (self::$pdo === null) {
            $config = require __DIR__ . '/../../config/config.php';

            $driver = $config['db_driver'] ?? 'mysql';
            $host   = $config['db_host'];
            $port   = $config['db_port'] ?? ($driver === 'pgsql' ? 5432 : 3306);
            $name   = $config['db_name'];

            if ($driver === 'pgsql') {
                // Supabase requires SSL. Port 6543 is the transaction pooler, which needs emulated prepares.
                $dsn     = "pgsql:host={$host};port={$port};dbname={$name};sslmode=" . ($config['db_sslmode'] ?? 'require');
                $options = [PDO::ATTR_EMULATE_PREPARES => true];
            } else {
                $dsn     = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
                $options = [PDO::ATTR_EMULATE_PREPARES => false];
            }

            self::$pdo = new PDO($dsn, $config['db_user'], $config['db_pass'], $options + [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        }
        return self::$pdo;
    }

    public static function driver(): string
    {
        return self::connection()->getAttribute(PDO::ATTR_DRIVER_NAME);
    }

    // Id of the row just inserted. PostgreSQL needs the identity sequence name; MySQL does not.
    public static function lastId(PDO $pdo, string $table, string $column): string
    {
        return $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'pgsql'
            ? $pdo->lastInsertId("{$table}_{$column}_seq")
            : $pdo->lastInsertId();
    }

    private function __construct() {}
}
