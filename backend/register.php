<?php
include 'config.php';

$raw_input = file_get_contents("php://input");
$data = json_decode($raw_input);

$username = trim($data->username ?? $_POST['username'] ?? '');
$password = trim($data->password ?? $_POST['password'] ?? '');
$full_name = trim($data->full_name ?? $_POST['full_name'] ?? '');
$email = trim($data->email ?? $_POST['email'] ?? '');
$bio = trim($data->bio ?? $_POST['bio'] ?? 'Hey there! I am using Instagram.');
$avatar_url = trim($data->avatar_url ?? $_POST['avatar_url'] ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200');

if (empty($username)) {
    echo json_encode(["status" => "error", "message" => "Username is required"]);
    $conn->close();
    exit();
}

if (empty($password)) {
    echo json_encode(["status" => "error", "message" => "Password is required"]);
    $conn->close();
    exit();
}

if (strlen($password) < 4) {
    echo json_encode(["status" => "error", "message" => "Password must be at least 4 characters long"]);
    $conn->close();
    exit();
}

if (empty($full_name)) {
    $full_name = $username;
}

// Clean username (lowercase, remove spaces)
$username = strtolower(preg_replace('/\s+/', '_', $username));

// Check if username already exists
$check_stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
$check_stmt->bind_param("s", $username);
$check_stmt->execute();
$check_res = $check_stmt->get_result();

if ($check_res && $check_res->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Username '@$username' is already registered. Please log in or choose a different username."]);
    $check_stmt->close();
    $conn->close();
    exit();
}
$check_stmt->close();

// Hash password
$hashed_password = password_hash($password, PASSWORD_BCRYPT);

$stmt = $conn->prepare("INSERT INTO users (username, password, email, full_name, bio, avatar_url) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $username, $hashed_password, $email, $full_name, $bio, $avatar_url);

if ($stmt->execute()) {
    $new_id = $stmt->insert_id;
    $user_query = $conn->query("SELECT id, username, email, full_name, bio, avatar_url, website, gender, category FROM users WHERE id = $new_id");
    $user = $user_query->fetch_assoc();
    $user['followers_count'] = 0;
    $user['following_count'] = 0;
    $user['posts_count'] = 0;

    echo json_encode([
        "status" => "success",
        "message" => "Account registered successfully!",
        "user" => $user
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Registration failed: " . $conn->error]);
}
$stmt->close();
$conn->close();
?>
