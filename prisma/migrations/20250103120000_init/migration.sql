-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `openId` VARCHAR(64) NOT NULL,
    `name` TEXT NULL,
    `email` VARCHAR(320) NULL,
    `loginMethod` VARCHAR(64) NULL,
    `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    `lastSignedIn` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `users_openId_key`(`openId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `funeral_homes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(320) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `address` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `funeral_homes_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `family_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(320) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `invitation_token` VARCHAR(255) NULL,
    `invitation_expiry` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `family_users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `memorials` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `birth_date` VARCHAR(10) NULL,
    `death_date` VARCHAR(10) NULL,
    `birthplace` VARCHAR(255) NULL,
    `filiation` TEXT NULL,
    `biography` TEXT NULL,
    `visibility` ENUM('public','private') NOT NULL DEFAULT 'public',
    `status` ENUM('active','pending_data','inactive') NOT NULL DEFAULT 'pending_data',
    `funeral_home_id` INTEGER NOT NULL,
    `family_user_id` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `memorials_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `descendants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memorial_id` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `relationship` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `photos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memorial_id` INTEGER NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `caption` TEXT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `dedications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memorial_id` INTEGER NOT NULL,
    `author_name` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `memorials_funeral_home_id_idx` ON `memorials`(`funeral_home_id`);
CREATE INDEX `memorials_family_user_id_idx` ON `memorials`(`family_user_id`);
CREATE INDEX `descendants_memorial_id_idx` ON `descendants`(`memorial_id`);
CREATE INDEX `photos_memorial_id_idx` ON `photos`(`memorial_id`);
CREATE INDEX `dedications_memorial_id_idx` ON `dedications`(`memorial_id`);
