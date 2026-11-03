<?php
// ping.php - Quick health check endpoint
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

mysqli_report(MYSQLI_REPORT_OFF);

$host = "127.0.0.1";
$user = "root";
$password = "";
$dbname = "insta_db";

$db_connected = false;
$db_error = null;
$users_count = 0;

$conn = @new mysqli($host, $user, $password, $dbname);
if ($conn->connect_error) {
    // Try localhost
    $host = "localhost";
    $conn = @new mysqli($host, $user, $password, $dbname);
}

if (!$conn->connect_error) {
    $db_connected = true;
    $res = @$conn->query("SELECT COUNT(*) as count FROM users");
    if ($res) {
        $users_count = (int)($res->fetch_assoc()['count'] ?? 0);
    }
    $conn->close();
} else {
    $db_error = $conn->connect_error;
}

echo json_encode([
    "status" => "success",
    "server" => "Apache/PHP is running",
    "database_connected" => $db_connected,
    "database_error" => $db_error,
    "users_in_db" => $users_count,
    "timestamp" => date("Y-m-d H:i:s")
]);
?>

