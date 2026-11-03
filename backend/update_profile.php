<?php
include 'config.php';

$raw_input = file_get_contents("php://input");
$data = json_decode($raw_input);

$user_id = intval($data->user_id ?? $_POST['user_id'] ?? 0);
$username = isset($data->username) ? trim($data->username) : (isset($_POST['username']) ? trim($_POST['username']) : null);
$full_name = isset($data->full_name) ? trim($data->full_name) : (isset($_POST['full_name']) ? trim($_POST['full_name']) : null);
$bio = isset($data->bio) ? trim($data->bio) : (isset($_POST['bio']) ? trim($_POST['bio']) : null);
$avatar_url = isset($data->avatar_url) ? trim($data->avatar_url) : (isset($_POST['avatar_url']) ? trim($_POST['avatar_url']) : null);
$website = isset($data->website) ? trim($data->website) : (isset($_POST['website']) ? trim($_POST['website']) : null);
$gender = isset($data->gender) ? trim($data->gender) : (isset($_POST['gender']) ? trim($_POST['gender']) : null);
$category = isset($data->category) ? trim($data->category) : (isset($_POST['category']) ? trim($_POST['category']) : null);
$email = isset($data->email) ? trim($data->email) : (isset($_POST['email']) ? trim($_POST['email']) : null);

if ($user_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Valid user_id is required"]);
    exit();
}

// Fetch existing user data
$cur_stmt = $conn->prepare("SELECT id, username, full_name, bio, avatar_url, website, gender, category, email FROM users WHERE id = ?");
$cur_stmt->bind_param("i", $user_id);
$cur_stmt->execute();
$cur_res = $cur_stmt->get_result();

if (!$cur_res || $cur_res->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "User not found"]);
    $cur_stmt->close();
    $conn->close();
    exit();
}
$current_user = $cur_res->fetch_assoc();
$cur_stmt->close();

// Check if username changed and is available
$final_username = ($username !== null && $username !== '') ? strtolower(preg_replace('/\s+/', '_', $username)) : $current_user['username'];
if ($final_username !== $current_user['username']) {
    $u_check = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
    $u_check->bind_param("si", $final_username, $user_id);
    $u_check->execute();
    if ($u_check->get_result()->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Username '@$final_username' is already taken."]);
        $u_check->close();
        $conn->close();
        exit();
    }
    $u_check->close();
}

$final_full_name = $full_name !== null ? $full_name : $current_user['full_name'];
$final_bio = $bio !== null ? $bio : $current_user['bio'];
$final_avatar_url = ($avatar_url !== null && $avatar_url !== '') ? $avatar_url : $current_user['avatar_url'];
$final_website = $website !== null ? $website : $current_user['website'];
$final_gender = $gender !== null ? $gender : $current_user['gender'];
$final_category = $category !== null ? $category : $current_user['category'];
$final_email = $email !== null ? $email : $current_user['email'];

$update_stmt = $conn->prepare("UPDATE users SET username = ?, full_name = ?, bio = ?, avatar_url = ?, website = ?, gender = ?, category = ?, email = ? WHERE id = ?");
$update_stmt->bind_param("ssssssssi", $final_username, $final_full_name, $final_bio, $final_avatar_url, $final_website, $final_gender, $final_category, $final_email, $user_id);

if ($update_stmt->execute()) {
    $followers = $conn->query("SELECT COUNT(*) as count FROM follows WHERE following_id = $user_id")->fetch_assoc()['count'] ?? 0;
    $following = $conn->query("SELECT COUNT(*) as count FROM follows WHERE follower_id = $user_id")->fetch_assoc()['count'] ?? 0;
    $posts_count = $conn->query("SELECT COUNT(*) as count FROM posts WHERE user_id = $user_id")->fetch_assoc()['count'] ?? 0;

    $updated_user = [
        "id" => $user_id,
        "username" => $final_username,
        "full_name" => $final_full_name,
        "bio" => $final_bio,
        "avatar_url" => $final_avatar_url,
        "website" => $final_website,
        "gender" => $final_gender,
        "category" => $final_category,
        "email" => $final_email,
        "followers_count" => (int)$followers,
        "following_count" => (int)$following,
        "posts_count" => (int)$posts_count
    ];

    echo json_encode([
        "status" => "success",
        "message" => "Profile updated successfully",
        "user" => $updated_user
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update profile: " . $conn->error]);
}
$update_stmt->close();
$conn->close();
?>
