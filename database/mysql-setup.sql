CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) CHARACTER SET utf8mb4 NOT NULL,
    `ProductVersion` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
    CONSTRAINT `PK___EFMigrationsHistory` PRIMARY KEY (`MigrationId`)
) CHARACTER SET=utf8mb4;

START TRANSACTION;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    ALTER DATABASE CHARACTER SET utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `passenger_attendance` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `route_stop_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `student_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `status` longtext CHARACTER SET utf8mb4 NOT NULL,
        `recorded_at` datetime(6) NULL,
        CONSTRAINT `PK_passenger_attendance` PRIMARY KEY (`id`)
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `routes` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `request_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `van_id` char(36) COLLATE ascii_general_ci NULL,
        `driver_id` char(36) COLLATE ascii_general_ci NULL,
        `status` longtext CHARACTER SET utf8mb4 NOT NULL,
        CONSTRAINT `PK_routes` PRIMARY KEY (`id`)
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `student_change_requests` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `student_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `requested_by_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `address_line` longtext CHARACTER SET utf8mb4 NOT NULL,
        `suburb` longtext CHARACTER SET utf8mb4 NULL,
        `city` longtext CHARACTER SET utf8mb4 NULL,
        `postcode` longtext CHARACTER SET utf8mb4 NULL,
        `status` longtext CHARACTER SET utf8mb4 NOT NULL,
        `reviewed_by_id` char(36) COLLATE ascii_general_ci NULL,
        `reviewed_at` datetime(6) NULL,
        `created_at` datetime(6) NOT NULL,
        CONSTRAINT `PK_student_change_requests` PRIMARY KEY (`id`)
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `users` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `full_name` longtext CHARACTER SET utf8mb4 NOT NULL,
        `email` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
        `password_hash` longtext CHARACTER SET utf8mb4 NOT NULL,
        `role` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
        `status` longtext CHARACTER SET utf8mb4 NOT NULL,
        `phone` longtext CHARACTER SET utf8mb4 NULL,
        `created_at` datetime(6) NOT NULL,
        CONSTRAINT `PK_users` PRIMARY KEY (`id`)
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `vans` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `registration_number` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
        `name` longtext CHARACTER SET utf8mb4 NULL,
        `capacity` int NOT NULL,
        `status` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
        `notes` longtext CHARACTER SET utf8mb4 NULL,
        CONSTRAINT `PK_vans` PRIMARY KEY (`id`)
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `route_stops` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `route_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `stop_order` int NOT NULL,
        `address` longtext CHARACTER SET utf8mb4 NOT NULL,
        `planned_arrival` time(6) NULL,
        `actual_arrival` datetime(6) NULL,
        CONSTRAINT `PK_route_stops` PRIMARY KEY (`id`),
        CONSTRAINT `FK_route_stops_routes_route_id` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `driver_profiles` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `user_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `licence_number` longtext CHARACTER SET utf8mb4 NULL,
        `licence_expiry` date NULL,
        `notes` longtext CHARACTER SET utf8mb4 NULL,
        CONSTRAINT `PK_driver_profiles` PRIMARY KEY (`id`),
        CONSTRAINT `FK_driver_profiles_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `student_profiles` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `user_id` char(36) COLLATE ascii_general_ci NULL,
        `student_number` varchar(255) CHARACTER SET utf8mb4 NOT NULL,
        `year_level` longtext CHARACTER SET utf8mb4 NULL,
        `emergency_notes` longtext CHARACTER SET utf8mb4 NULL,
        CONSTRAINT `PK_student_profiles` PRIMARY KEY (`id`),
        CONSTRAINT `FK_student_profiles_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `transport_requests` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `created_by_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `journey_type` varchar(64) CHARACTER SET utf8mb4 NOT NULL,
        `title` longtext CHARACTER SET utf8mb4 NOT NULL,
        `description` longtext CHARACTER SET utf8mb4 NULL,
        `journey_date` date NOT NULL,
        `planned_start_time` time(6) NOT NULL,
        `planned_end_time` time(6) NULL,
        `standard_pickup_location` longtext CHARACTER SET utf8mb4 NULL,
        `destination` longtext CHARACTER SET utf8mb4 NOT NULL,
        `status` varchar(32) CHARACTER SET utf8mb4 NOT NULL,
        `reviewed_by_id` char(36) COLLATE ascii_general_ci NULL,
        `reviewed_at` datetime(6) NULL,
        `review_notes` longtext CHARACTER SET utf8mb4 NULL,
        `created_at` datetime(6) NOT NULL,
        CONSTRAINT `PK_transport_requests` PRIMARY KEY (`id`),
        CONSTRAINT `FK_transport_requests_users_created_by_id` FOREIGN KEY (`created_by_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `student_addresses` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `student_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `address_line` longtext CHARACTER SET utf8mb4 NOT NULL,
        `suburb` longtext CHARACTER SET utf8mb4 NULL,
        `city` longtext CHARACTER SET utf8mb4 NULL,
        `postcode` longtext CHARACTER SET utf8mb4 NULL,
        `is_current` tinyint(1) NOT NULL,
        `created_at` datetime(6) NOT NULL,
        CONSTRAINT `PK_student_addresses` PRIMARY KEY (`id`),
        CONSTRAINT `FK_student_addresses_student_profiles_student_id` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE TABLE `request_students` (
        `id` char(36) COLLATE ascii_general_ci NOT NULL,
        `request_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `student_id` char(36) COLLATE ascii_general_ci NOT NULL,
        `special_notes` longtext CHARACTER SET utf8mb4 NULL,
        CONSTRAINT `PK_request_students` PRIMARY KEY (`id`),
        CONSTRAINT `FK_request_students_student_profiles_student_id` FOREIGN KEY (`student_id`) REFERENCES `student_profiles` (`id`) ON DELETE RESTRICT,
        CONSTRAINT `FK_request_students_transport_requests_request_id` FOREIGN KEY (`request_id`) REFERENCES `transport_requests` (`id`) ON DELETE CASCADE
    ) CHARACTER SET=utf8mb4;

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE UNIQUE INDEX `IX_driver_profiles_user_id` ON `driver_profiles` (`user_id`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE UNIQUE INDEX `IX_request_students_request_id_student_id` ON `request_students` (`request_id`, `student_id`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE INDEX `IX_request_students_student_id` ON `request_students` (`student_id`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE INDEX `IX_route_stops_route_id` ON `route_stops` (`route_id`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE INDEX `IX_student_addresses_student_id` ON `student_addresses` (`student_id`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE UNIQUE INDEX `IX_student_profiles_student_number` ON `student_profiles` (`student_number`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE UNIQUE INDEX `IX_student_profiles_user_id` ON `student_profiles` (`user_id`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE INDEX `IX_transport_requests_created_by_id` ON `transport_requests` (`created_by_id`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE UNIQUE INDEX `IX_users_email` ON `users` (`email`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    CREATE UNIQUE INDEX `IX_vans_registration_number` ON `vans` (`registration_number`);

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

DROP PROCEDURE IF EXISTS MigrationsScript;
DELIMITER //
CREATE PROCEDURE MigrationsScript()
BEGIN
    IF NOT EXISTS(SELECT 1 FROM `__EFMigrationsHistory` WHERE `MigrationId` = '20261117023947_InitialMySql') THEN

    INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
    VALUES ('20261117023947_InitialMySql', '8.0.8');

    END IF;
END //
DELIMITER ;
CALL MigrationsScript();
DROP PROCEDURE MigrationsScript;

COMMIT;

