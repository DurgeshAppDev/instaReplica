<?php
include 'config.php';

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
$current_user_id = isset($_GET['current_user_id']) ? intval($_GET['current_user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Valid user_id is required"]);
    exit();
}

$stmt = $conn->prepare("SELECT id, username, full_name, email, bio, avatar_url, website, gender, category, created_at FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res && $res->num_rows > 0) {
    $user = $res->fetch_assoc();

    $followers = $conn->query("SELECT COUNT(*) as count FROM follows WHERE following_id = $user_id")->fetch_assoc()['count'] ?? 0;
    $following = $conn->query("SELECT COUNT(*) as count FROM follows WHERE follower_id = $user_id")->fetch_assoc()['count'] ?? 0;
    
    $posts_query = $conn->query("SELECT id, image_url, caption, created_at FROM posts WHERE user_id = $user_id ORDER BY id DESC");
    $posts = [];
    if ($posts_query) {
        while ($post = $posts_query->fetch_assoc()) {
            $posts[] = $post;
        }
    }

    $is_following = false;
    if ($current_user_id > 0 && $current_user_id !== $user_id) {
        $follow_check = $conn->query("SELECT id FROM follows WHERE follower_id = $current_user_id AND following_id = $user_id");
        $is_following = ($follow_check && $follow_check->num_rows > 0);
    }

    $user['followers_count'] = (int)$followers;
    $user['following_count'] = (int)$following;
    $user['posts_count'] = count($posts);
    $user['posts'] = $posts;
    $user['is_following'] = $is_following;

    echo json_encode(["status" => "success", "data" => $user]);
} else {
    echo json_encode(["status" => "error", "message" => "User not found"]);
}
$stmt->close();
$conn->close();
?>
