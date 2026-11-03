<?php
include 'config.php';

$raw_input = file_get_contents("php://input");
$data = json_decode($raw_input);

$follower_id = intval($data->follower_id ?? $_POST['follower_id'] ?? 0);
$following_id = intval($data->following_id ?? $_POST['following_id'] ?? 0);

if ($follower_id > 0 && $following_id > 0 && $follower_id !== $following_id) {
    $check = $conn->prepare("SELECT id FROM follows WHERE follower_id = ? AND following_id = ?");
    $check->bind_param("ii", $follower_id, $following_id);
    $check->execute();
    $check_res = $check->get_result();

    if ($check_res && $check_res->num_rows > 0) {
        $del = $conn->prepare("DELETE FROM follows WHERE follower_id = ? AND following_id = ?");
        $del->bind_param("ii", $follower_id, $following_id);
        $del->execute();
        $del->close();
        $action = "unfollowed";
        $is_following = false;
    } else {
        $ins = $conn->prepare("INSERT INTO follows (follower_id, following_id) VALUES (?, ?)");
        $ins->bind_param("ii", $follower_id, $following_id);
        $ins->execute();
        $ins->close();
        $action = "followed";
        $is_following = true;
    }
    $check->close();

    $followers_count = (int)($conn->query("SELECT COUNT(*) as count FROM follows WHERE following_id = $following_id")->fetch_assoc()['count'] ?? 0);

    echo json_encode([
        "status" => "success",
        "action" => $action,
        "is_following" => $is_following,
        "followers_count" => $followers_count
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid follower_id or following_id parameters"]);
}
$conn->close();
?>

