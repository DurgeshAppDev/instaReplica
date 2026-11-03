-- phpMyAdmin SQL Dump
-- Database: insta_db
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `insta_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `insta_db`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `follows`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `follows` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_follow` (`follower_id`, `following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Table structure for table `posts`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `image_url` text NOT NULL,
  `caption` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Sample Data for `users` (Default password: password123)
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `username`, `password`, `email`, `full_name`, `bio`, `avatar_url`, `website`, `gender`, `category`) VALUES
(1, 'santosh_dev', '$2y$10$wTfZl36B69K7fH19e2lY3eZ0vPqG8N/50tZk7Y1qG7GvL4c6qYp2.', 'santosh@example.com', 'Santosh Kumar', 'Mobile & Full-Stack Developer 🚀\nBuilding React Native Apps.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', 'https://github.com/santosh', 'Male', 'Developer'),
(2, 'alex_river', '$2y$10$wTfZl36B69K7fH19e2lY3eZ0vPqG8N/50tZk7Y1qG7GvL4c6qYp2.', 'alex@example.com', 'Alex River', 'Visual storyteller | Travel photography 📸\nCapturing moments across the globe 🌍', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', 'https://alexriver.photo', 'Female', 'Creator'),
(3, 'sarah_art', '$2y$10$wTfZl36B69K7fH19e2lY3eZ0vPqG8N/50tZk7Y1qG7GvL4c6qYp2.', 'sarah@example.com', 'Sarah Jenkins', 'Digital Artist & UI/UX Designer 🎨✨\nDaily creative doodles & concepts.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', 'https://behance.net/sarah', 'Female', 'Artist'),
(4, 'mike_travels', '$2y$10$wTfZl36B69K7fH19e2lY3eZ0vPqG8N/50tZk7Y1qG7GvL4c6qYp2.', 'mike@example.com', 'Mike Anderson', 'Backpacker & Explorer 🏔️\nLiving life one mountain peak at a time 🏕️', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200', 'https://miketravels.blog', 'Male', 'Explorer'),
(5, 'emily_fitness', '$2y$10$wTfZl36B69K7fH19e2lY3eZ0vPqG8N/50tZk7Y1qG7GvL4c6qYp2.', 'emily@example.com', 'Emily Watson', 'Fitness Coach & Nutritionist 💪\nEat clean, train dirty, stay positive!', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', 'https://emilyfit.co', 'Female', 'Health/Beauty'),
(6, 'david_code', '$2y$10$wTfZl36B69K7fH19e2lY3eZ0vPqG8N/50tZk7Y1qG7GvL4c6qYp2.', 'david@example.com', 'David Miller', 'Cloud Engineer & Open Source Contributor 💻\nDocker, K8s, and NodeJS enthusiast.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', 'https://davidmiller.dev', 'Male', 'Engineer')
ON DUPLICATE KEY UPDATE 
  `password` = VALUES(`password`),
  `full_name` = VALUES(`full_name`),
  `bio` = VALUES(`bio`),
  `avatar_url` = VALUES(`avatar_url`),
  `website` = VALUES(`website`),
  `gender` = VALUES(`gender`),
  `category` = VALUES(`category`);

-- --------------------------------------------------------
-- Sample Data for `follows`
-- --------------------------------------------------------

INSERT IGNORE INTO `follows` (`follower_id`, `following_id`) VALUES
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(3, 1),
(4, 1),
(5, 1),
(2, 3),
(3, 4),
(4, 5);

-- --------------------------------------------------------
-- Sample Data for `posts`
-- --------------------------------------------------------

INSERT INTO `posts` (`user_id`, `image_url`, `caption`) VALUES
(1, 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500', 'Coding late into the night 💻 #developer #reactnative'),
(1, 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500', 'Matrix vibes in terminal 🟢'),
(1, 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500', 'Desk setup ready for the week! 🚀'),
(1, 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500', 'Clean architecture in action.'),
(1, 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500', 'Bug fixed after 3 hours ☕'),
(1, 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500', 'Ready for deployment.'),

(2, 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500', 'Road trip through the canyon 🚗'),
(2, 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500', 'Serene lake views this morning 🛶'),
(2, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500', 'Sunset at the beach 🌅'),
(2, 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500', 'Hidden alleys of Europe 🏰'),

(3, 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500', 'Color palette exploration 🎨'),
(3, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500', 'New oil paint collection ✨'),
(3, 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500', 'Abstract geometry on canvas 🖌️'),

(4, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500', 'Summit reached! 3500m high 🏔️'),
(4, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500', 'Yosemite valley mist 🌲'),
(4, 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500', 'Starry nights around the campfire 🔥'),

(5, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500', 'Morning gym session completed 💪'),
(5, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500', 'Healthy bowl of goodness 🥑🥗'),
(5, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500', 'Fuel your body right! 🍉'),

(6, 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=500', 'Building microservices today 🐳'),
(6, 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500', 'Cybersecurity workspace setup 🛡️');
