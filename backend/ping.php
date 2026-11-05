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

include_once 'config.php';

$users_count = 0;
if (isset($conn) && !$conn->connect_error) {
    $res = @$conn->query("SELECT COUNT(*) as count FROM users");
    if ($res) {
        $users_count = (int)($res->fetch_assoc()['count'] ?? 0);
    }
}

echo json_encode([
    "status" => "success",
    "server" => "Apache/PHP is running",
    "database_connected" => (isset($conn) && !$conn->connect_error),
    "database_error" => (isset($conn) && $conn->connect_error ? $conn->connect_error : null),
    "users_in_db" => $users_count,
    "timestamp" => date("Y-m-d H:i:s")
]);
?>

