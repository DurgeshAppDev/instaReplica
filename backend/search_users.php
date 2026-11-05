<?php
include 'config.php';

$current_user_id = isset($_GET['current_user_id']) ? intval($_GET['current_user_id']) : 0;
$search = isset($_GET['query']) ? trim($_GET['query']) : '';

if (!empty($search)) {
    $search_param = "%" . $conn->real_escape_string($search) . "%";
    $sql = "SELECT u.id, u.username, u.full_name, u.bio, u.avatar_url,
            IF(f.follower_id IS NOT NULL, 1, 0) AS is_following
            FROM users u
            LEFT JOIN follows f ON f.following_id = u.id AND f.follower_id = $current_user_id
            WHERE (u.username LIKE '$search_param' OR u.full_name LIKE '$search_param')
            " . ($current_user_id > 0 ? "AND u.id != $current_user_id" : "") . "
            ORDER BY u.id DESC
            LIMIT 50";
} else {
    // When no search query is provided, show all users (suggested users with newest users first)
    $sql = "SELECT u.id, u.username, u.full_name, u.bio, u.avatar_url,
            IF(f.follower_id IS NOT NULL, 1, 0) AS is_following
            FROM users u
            LEFT JOIN follows f ON f.following_id = u.id AND f.follower_id = $current_user_id
            " . ($current_user_id > 0 ? "WHERE u.id != $current_user_id" : "") . "
            ORDER BY u.id DESC
            LIMIT 50";
}

$result = $conn->query($sql);
$users = [];

if ($result) {
    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int)$row['id'];
        $row['is_following'] = (bool)$row['is_following'];
        $users[] = $row;
    }
}

echo json_encode(["status" => "success", "data" => $users]);
$conn->close();
?>
