<?php
include 'config.php';

$user_id = intval($_GET['user_id'] ?? 0);
$type = isset($_GET['type']) && strtolower($_GET['type']) === 'following' ? 'following' : 'followers';
$current_user_id = intval($_GET['current_user_id'] ?? 0);

if ($user_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Valid user_id is required"]);
    exit();
}

if ($type === 'following') {
    // Users that $user_id is following
    $sql = "SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio,
            IF(f2.follower_id IS NOT NULL, 1, 0) AS is_following
            FROM follows f
            JOIN users u ON f.following_id = u.id
            LEFT JOIN follows f2 ON f2.following_id = u.id AND f2.follower_id = $current_user_id
            WHERE f.follower_id = $user_id
            ORDER BY f.id DESC";
} else {
    // Users that follow $user_id
    $sql = "SELECT u.id, u.username, u.full_name, u.avatar_url, u.bio,
            IF(f2.follower_id IS NOT NULL, 1, 0) AS is_following
            FROM follows f
            JOIN users u ON f.follower_id = u.id
            LEFT JOIN follows f2 ON f2.following_id = u.id AND f2.follower_id = $current_user_id
            WHERE f.following_id = $user_id
            ORDER BY f.id DESC";
}

$res = $conn->query($sql);
$list = [];

if ($res) {
    while ($row = $res->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['is_following'] = (bool)$row['is_following'];
        $list[] = $row;
    }
}

echo json_encode([
    "status" => "success",
    "type" => $type,
    "user_id" => $user_id,
    "data" => $list
]);

$conn->close();
?>

