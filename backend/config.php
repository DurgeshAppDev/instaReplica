<?php
// CORS headers for React Native and browser access
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Disable strict exception throwing in PHP 8.1/8.2 to handle errors gracefully
mysqli_report(MYSQLI_REPORT_OFF);

// Database Credentials for phpMyAdmin / XAMPP MySQL
$host = "127.0.0.1";
$user = "root";
$password = "";
$dbname = "insta_db";

// Connect to MySQL (try 127.0.0.1 first)
$conn = @new mysqli($host, $user, $password, $dbname);

// If 127.0.0.1 fails, try localhost
if ($conn->connect_error) {
    $host = "localhost";
    $conn = @new mysqli($host, $user, $password, $dbname);
}

// If database unknown or does not exist, automatically create it
if ($conn->connect_error) {
    $admin_conn = @new mysqli("127.0.0.1", $user, $password);
    if ($admin_conn->connect_error) {
        $admin_conn = @new mysqli("localhost", $user, $password);
    }
    if (!$admin_conn->connect_error) {
        $admin_conn->query("CREATE DATABASE IF NOT EXISTS `insta_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;");
        $admin_conn->close();
        $conn = @new mysqli("127.0.0.1", $user, $password, $dbname);
        if ($conn->connect_error) {
            $conn = @new mysqli("localhost", $user, $password, $dbname);
        }
    }
}

// Final connection check
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error,
        "hint" => "Please make sure MySQL is started in XAMPP Control Panel."
    ]);
    exit();
}

$conn->set_charset("utf8mb4");

// Auto-create tables if they do not exist
$conn->query("CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL DEFAULT '',
  `bio` text DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'Personal',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS `follows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_follow` (`follower_id`, `following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

$conn->query("CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `image_url` text NOT NULL,
  `caption` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

// Auto-upgrade columns for pre-existing tables if needed
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `password` VARCHAR(255) DEFAULT NULL;");
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `email` VARCHAR(150) DEFAULT NULL;");
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `website` VARCHAR(255) DEFAULT NULL;");
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `gender` VARCHAR(50) DEFAULT NULL;");
@$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS `category` VARCHAR(50) DEFAULT 'Personal';");

// Seed sample users & posts if users table is empty
$checkUsers = @$conn->query("SELECT COUNT(*) AS count FROM users;");
if ($checkUsers) {
    $rowCount = (int)($checkUsers->fetch_assoc()['count'] ?? 0);
    if ($rowCount === 0) {
        $default_hash = password_hash('password123', PASSWORD_BCRYPT);
        @$conn->query("INSERT INTO `users` (`id`, `username`, `password`, `email`, `full_name`, `bio`, `avatar_url`, `website`, `gender`, `category`) VALUES
        (1, 'santosh_dev', '$default_hash', 'santosh@example.com', 'Santosh Kumar', 'Mobile & Full-Stack Developer 🚀\\nBuilding React Native Apps.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', 'https://github.com/santosh', 'Male', 'Developer'),
        (2, 'alex_river', '$default_hash', 'alex@example.com', 'Alex River', 'Visual storyteller | Travel photography 📸\\nCapturing moments across the globe 🌍', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', 'https://alexriver.photo', 'Female', 'Creator'),
        (3, 'sarah_art', '$default_hash', 'sarah@example.com', 'Sarah Jenkins', 'Digital Artist & UI/UX Designer 🎨✨\\nDaily creative doodles & concepts.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'https://behance.net/sarah', 'Female', 'Artist'),
        (4, 'mike_travels', '$default_hash', 'mike@example.com', 'Mike Anderson', 'Backpacker & Explorer 🏔️\\nLiving life one mountain peak at a time 🏕️', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'https://miketravels.blog', 'Male', 'Explorer'),
        (5, 'emily_fitness', '$default_hash', 'emily@example.com', 'Emily Watson', 'Fitness Coach & Nutritionist 💪\\nEat clean, train dirty, stay positive!', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', 'https://emilyfit.co', 'Female', 'Health/Beauty'),
        (6, 'david_code', '$default_hash', 'david@example.com', 'David Miller', 'Cloud Engineer & Open Source Contributor 💻\\nDocker, K8s, and NodeJS enthusiast.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'https://davidmiller.dev', 'Male', 'Engineer');");

        @$conn->query("INSERT IGNORE INTO `follows` (`follower_id`, `following_id`) VALUES (1, 2), (1, 3), (1, 4), (2, 1), (3, 1), (4, 1), (5, 1), (2, 3), (3, 4), (4, 5);");

        @$conn->query("INSERT INTO `posts` (`user_id`, `image_url`, `caption`) VALUES
        (1, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500', 'Coding late into the night 💻 #developer #reactnative'),
        (1, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500', 'Desk setup ready for the week! 🚀'),
        (2, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500', 'Exploring new roads 🚙 #travel'),
        (3, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500', 'Creative vibes ✨ #digitalart');");
    }
}

// Ensure default password 'password123' for any pre-existing users without password
$default_hash = password_hash('password123', PASSWORD_BCRYPT);
@$conn->query("UPDATE users SET password = '$default_hash' WHERE password IS NULL OR password = ''");
?>
