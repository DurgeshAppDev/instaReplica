<?php
// CORS headers for React Native and browser access
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Disable strict exception throwing in PHP 8.1/8.2 to handle errors gracefully
mysqli_report(MYSQLI_REPORT_OFF);

// Database Credentials for phpMyAdmin / XAMPP MySQL
$host = "127.0.0.1";
$user = "root";
$password = "";
$dbname = "insta_db";

// Connect to MySQL (try 127.0.0.1 first)
$conn = @new mysqli($host, $user, $password, $dbname);

// If 127.0.0.1 fails, try localhost
if ($conn->connect_error) {
    $host = "localhost";
    $conn = @new mysqli($host, $user, $password, $dbname);
}

// If database unknown, attempt to create it
if ($conn->connect_error && (strpos($conn->connect_error, "Unknown database") !== false || strpos($conn->connect_error, "database") !== false)) {
    $admin_conn = @new mysqli("127.0.0.1", $user, $password);
    if (!$admin_conn->connect_error) {
        $admin_conn->query("CREATE DATABASE IF NOT EXISTS `insta_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;");
        $admin_conn->close();
        $conn = @new mysqli("127.0.0.1", $user, $password, $dbname);
    }
}

// Final connection check
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error,
        "hint" => "Please make sure MySQL is started in XAMPP and database 'insta_db' exists in phpMyAdmin."
    ]);
    exit();
}

$conn->set_charset("utf8mb4");

// Auto-upgrade columns for professional site features: password, email, website, gender, category
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `password` VARCHAR(255) DEFAULT NULL;");
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `email` VARCHAR(150) DEFAULT NULL;");
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `website` VARCHAR(255) DEFAULT NULL;");
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `gender` VARCHAR(50) DEFAULT NULL;");
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `category` VARCHAR(50) DEFAULT 'Personal';");

// Ensure default password 'password123' for any pre-existing users without password
$default_hash = password_hash('password123', PASSWORD_BCRYPT);
@$conn->query("UPDATE users SET password = '$default_hash' WHERE password IS NULL OR password = ''");
?>
