<?php
include 'config.php';

$upload_dir = __DIR__ . '/uploads/avatars/';
if (!file_exists($upload_dir)) {
    @mkdir($upload_dir, 0777, true);
}

$user_id = 0;
$avatar_url = '';

// Check if multipart form upload
if (!empty($_FILES['image'])) {
    $user_id = intval($_POST['user_id'] ?? 0);
    $file = $_FILES['image'];
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    if (empty($ext)) $ext = 'jpg';
    $filename = 'avatar_' . ($user_id > 0 ? $user_id : 'temp') . '_' . time() . '.' . $ext;
    $target_path = $upload_dir . $filename;

    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        // Construct public URL
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $avatar_url = $protocol . $host . '/insta-api/uploads/avatars/' . $filename;
    }
} else {
    // Check if Base64 JSON upload
    $raw_input = file_get_contents("php://input");
    $data = json_decode($raw_input);

    if (!empty($data->image_base64)) {
        $user_id = intval($data->user_id ?? 0);
        $base64_data = $data->image_base64;
        
        // Remove data uri prefix if present (e.g. data:image/jpeg;base64,)
        if (preg_match('/^data:image\/(\w+);base64,/', $base64_data, $type)) {
            $base64_data = substr($base64_data, strpos($base64_data, ',') + 1);
            $ext = strtolower($type[1]);
        } else {
            $ext = 'jpg';
        }

        $decoded_image = base64_decode($base64_data);
        if ($decoded_image !== false) {
            $filename = 'avatar_' . ($user_id > 0 ? $user_id : 'temp') . '_' . time() . '.' . $ext;
            $target_path = $upload_dir . $filename;
            if (file_put_contents($target_path, $decoded_image)) {
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
                $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
                $avatar_url = $protocol . $host . '/insta-api/uploads/avatars/' . $filename;
            }
        }
    }
}

if (!empty($avatar_url)) {
    // If user_id provided, update database
    if ($user_id > 0) {
        $stmt = $conn->prepare("UPDATE users SET avatar_url = ? WHERE id = ?");
        $stmt->bind_param("si", $avatar_url, $user_id);
        $stmt->execute();
        $stmt->close();
    }

    echo json_encode([
        "status" => "success",
        "avatar_url" => $avatar_url,
        "message" => "Image uploaded successfully"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "No image received or upload failed"
    ]);
}

$conn->close();
?>

