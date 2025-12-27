CREATE TABLE `dedications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memorial_id` int NOT NULL,
	`author_name` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dedications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `descendants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memorial_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`relationship` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `descendants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `family_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255),
	`phone` varchar(20),
	`invitation_token` varchar(255),
	`invitation_expiry` timestamp,
	`is_active` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `family_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `family_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `funeral_homes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`phone` varchar(20),
	`address` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `funeral_homes_id` PRIMARY KEY(`id`),
	CONSTRAINT `funeral_homes_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `memorials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`birth_date` varchar(10),
	`death_date` varchar(10),
	`birthplace` varchar(255),
	`filiation` text,
	`biography` text,
	`visibility` enum('public','private') NOT NULL DEFAULT 'public',
	`status` enum('active','pending_data','inactive') NOT NULL DEFAULT 'pending_data',
	`funeral_home_id` int NOT NULL,
	`family_user_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memorials_id` PRIMARY KEY(`id`),
	CONSTRAINT `memorials_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`memorial_id` int NOT NULL,
	`file_url` varchar(500) NOT NULL,
	`caption` text,
	`order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `photos_id` PRIMARY KEY(`id`)
);
