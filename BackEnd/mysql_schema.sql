-- MySQL Database Schema Dump
-- Converted from SQLite
-- Generated at: 2026-01-30T16:53:44.112Z

SET FOREIGN_KEY_CHECKS=0;

-- TABLE: events
CREATE TABLE `events` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` TEXT NOT NULL,
    `date` DATE NOT NULL,
    `location` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(255) NOT NULL,
    `price` DECIMAL(10, 2) DEFAULT 0.00,
    `image` TEXT NOT NULL,
    `slots` INT DEFAULT 50,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: users
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(20) DEFAULT 'customer' CHECK(role IN ('customer', 'admin', 'super_admin')),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: push_subscriptions
CREATE TABLE `push_subscriptions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `endpoint` TEXT NOT NULL,
    `p256dh` TEXT NOT NULL,
    `auth` TEXT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- TABLE: products
CREATE TABLE `products` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `short_description` TEXT,
    `description` TEXT,
    `image` TEXT,
    `rating` DECIMAL(3, 2) DEFAULT 0,
    `reviews_count` INT DEFAULT 0,
    `stock` INT NOT NULL DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: instructors
CREATE TABLE `instructors` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` TEXT NOT NULL,
    `bio` TEXT,
    `image` TEXT,
    `email` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: workshops
CREATE TABLE `workshops` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` TEXT NOT NULL,
    `date` DATE NOT NULL,
    `duration` VARCHAR(255),
    `location` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `category` VARCHAR(255) NOT NULL,
    `instructor_id` INT,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `image` TEXT NOT NULL,
    `slots` INT DEFAULT 20,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`instructor_id`) REFERENCES `instructors`(`id`) ON DELETE SET NULL
);

-- TABLE: subscriptions
CREATE TABLE `subscriptions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `type` VARCHAR(50) NOT NULL,
    `image` TEXT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- TABLE: event_agenda
CREATE TABLE `event_agenda` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `event_id` INT NOT NULL,
    `time` VARCHAR(255) NOT NULL,
    `activity` TEXT NOT NULL,
    `display_order` INT NOT NULL,
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
);

-- TABLE: event_bookings
CREATE TABLE `event_bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `event_id` INT NOT NULL,
    `booking_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `attendees` INT DEFAULT 1,
    `status` VARCHAR(50) DEFAULT 'confirmed',
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
);

-- TABLE: event_highlights
CREATE TABLE `event_highlights` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `event_id` INT NOT NULL,
    `highlight` TEXT NOT NULL,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
);

-- TABLE: event_speakers
CREATE TABLE `event_speakers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `event_id` INT NOT NULL,
    `name` TEXT NOT NULL,
    `role` TEXT NOT NULL,
    `image` TEXT,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE
);

-- TABLE: orders
CREATE TABLE `orders` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `total_amount` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(50) DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
    `payment_method` VARCHAR(50) DEFAULT 'card',
    `delivery_address` TEXT,
    `recipient_name` VARCHAR(100),
    `recipient_phone` VARCHAR(20),
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- TABLE: order_items
CREATE TABLE `order_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `order_id` INT NOT NULL,
    `product_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `price_at_purchase` DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT
);

-- TABLE: product_features
CREATE TABLE `product_features` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `feature` TEXT NOT NULL,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);


-- TABLE: product_reviews
CREATE TABLE `product_reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `rating` INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    `review_title` VARCHAR(200),
    `review_text` TEXT,
    `helpful_count` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_review` (`product_id`, `user_id`)
);

-- TABLE: product_specifications
CREATE TABLE `product_specifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `product_id` INT NOT NULL,
    `spec_key` TEXT NOT NULL,
    `spec_value` TEXT NOT NULL,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
);

-- TABLE: subscription_features
CREATE TABLE `subscription_features` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subscription_id` INT NOT NULL,
    `feature` TEXT NOT NULL,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE
);


-- TABLE: subscription_reviews
CREATE TABLE `subscription_reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subscription_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `rating` INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    `review_text` TEXT,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_sub_review` (`subscription_id`, `user_id`)
);

-- TABLE: subscription_specifications
CREATE TABLE `subscription_specifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `subscription_id` INT NOT NULL,
    `spec_key` VARCHAR(255) NOT NULL,
    `spec_value` TEXT NOT NULL,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE
);


-- TABLE: user_subscriptions
CREATE TABLE `user_subscriptions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `subscription_id` INT NOT NULL,
    `start_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(20) DEFAULT 'active' CHECK(status IN ('active', 'cancelled')),
    `frequency` VARCHAR(20) DEFAULT 'monthly' CHECK(frequency IN ('weekly', 'bi-weekly', 'monthly')),
    `box_size` VARCHAR(20) DEFAULT 'medium',
    `delivery_day` VARCHAR(20),
    `delivery_date` INT,
    `delivery_address` TEXT,
    `delivery_city` VARCHAR(100),
    `delivery_state` VARCHAR(50),
    `delivery_zip` VARCHAR(20),
    `delivery_phone` VARCHAR(20),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON DELETE CASCADE
);

-- TABLE: workshop_agenda
CREATE TABLE `workshop_agenda` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `workshop_id` INT NOT NULL,
    `time` VARCHAR(255) NOT NULL,
    `activity` TEXT NOT NULL,
    `display_order` INT NOT NULL,
    FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON DELETE CASCADE
);

-- TABLE: workshop_bookings
CREATE TABLE `workshop_bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `workshop_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `tickets` INT NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `booking_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `status` VARCHAR(50) DEFAULT 'confirmed',
    FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);

-- TABLE: workshop_learning_outcomes
CREATE TABLE `workshop_learning_outcomes` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `workshop_id` INT NOT NULL,
    `outcome` TEXT NOT NULL,
    `display_order` INT DEFAULT 0,
    FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON DELETE CASCADE
);


-- TABLE: workshop_reviews
CREATE TABLE `workshop_reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `workshop_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `rating` INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
    `review_title` VARCHAR(200),
    `review_text` TEXT,
    `helpful_count` INT DEFAULT 0,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`workshop_id`) REFERENCES `workshops`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_workshop_review` (`workshop_id`, `user_id`)
);



-- Indexes
CREATE INDEX `idx_events_category` ON `events`(`category`);
CREATE INDEX `idx_events_date` ON `events`(`date`);
CREATE INDEX `idx_order_items_order` ON `order_items`(`order_id`);
CREATE INDEX `idx_orders_date` ON `orders`(`created_at`);
CREATE INDEX `idx_orders_user` ON `orders`(`user_id`);
CREATE INDEX `idx_products_category` ON `products`(`category`);
CREATE INDEX `idx_reviews_product` ON `product_reviews`(`product_id`);
CREATE INDEX `idx_reviews_rating` ON `product_reviews`(`rating`);
CREATE INDEX `idx_reviews_user` ON `product_reviews`(`user_id`);
CREATE INDEX `idx_users_email` ON `users`(`email`);
CREATE INDEX `idx_users_role` ON `users`(`role`);
CREATE INDEX `idx_workshop_reviews_rating` ON `workshop_reviews`(`rating`);
CREATE INDEX `idx_workshop_reviews_user` ON `workshop_reviews`(`user_id`);
CREATE INDEX `idx_workshop_reviews_workshop` ON `workshop_reviews`(`workshop_id`);
CREATE INDEX `idx_workshops_category` ON `workshops`(`category`);
CREATE INDEX `idx_workshops_date` ON `workshops`(`date`);

SET FOREIGN_KEY_CHECKS=1;
