<?php
include 'config.php';

$raw_input = file_get_contents("php://input");
$data = json_decode($raw_input);

$username = trim($data->username ?? $_POST['username'] ?? '');
$password = trim($data->password ?? $_POST['password'] ?? '');

if (empty($username)) {
    echo json_encode(["status" => "error", "message" => "Please enter your username"]);
    $conn->close();
    exit();
}

if (empty($password)) {
    echo json_encode(["status" => "error", "message" => "Please enter your password"]);
    $conn->close();
    exit();
}

// Check if user exists
$stmt = $conn->prepare("SELECT id, username, password, email, full_name, bio, avatar_url, website, gender, category FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if (!$result || $result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Account '@$username' does not exist. Please register first."
    ]);
    $stmt->close();
    $conn->close();
    exit();
}

$user = $result->fetch_assoc();
$stmt->close();

// Password Verification
$password_valid = false;
if (!empty($user['password'])) {
    if (password_verify($password, $user['password']) || $password === $user['password']) {
        $password_valid = true;
    }
} else {
    // If user has no password yet (legacy), allow password123
    if ($password === 'password123') {
        $password_valid = true;
    }
}

if (!$password_valid) {
    echo json_encode([
        "status" => "error",
        "message" => "Incorrect password for @$username. Please try again."
    ]);
    $conn->close();
    exit();
}

// Remove password hash from response
unset($user['password']);

$user_id = intval($user['id']);

// Count followers, following, posts
$followers = $conn->query("SELECT COUNT(*) as count FROM follows WHERE following_id = $user_id")->fetch_assoc()['count'] ?? 0;
$following = $conn->query("SELECT COUNT(*) as count FROM follows WHERE follower_id = $user_id")->fetch_assoc()['count'] ?? 0;
$posts_count = $conn->query("SELECT COUNT(*) as count FROM posts WHERE user_id = $user_id")->fetch_assoc()['count'] ?? 0;

$user['followers_count'] = (int)$followers;
$user['following_count'] = (int)$following;
$user['posts_count'] = (int)$posts_count;

echo json_encode(["status" => "success", "user" => $user]);
$conn->close();
?>
