
-- DROP DATABASE `db000`;

CREATE DATABASE `db000` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `db000`;

CREATE TABLE `access` (
  `ip_addr` VARCHAR(16) NOT NULL,
  `ip_desc` VARCHAR(255) NOT NULL,
  `is_deleted` CHAR(1) NOT NULL,
  `by_whom` VARCHAR(64) NOT NULL,
  `insert_time` DATETIME NOT NULL DEFAULT NOW(),
  `delete_time` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`ip_addr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `access` VALUES ('1.1.1.*', 'HOME', 'N', 'steve', NOW(), '1970-01-01 00:00:00');

CREATE TABLE `admin` (
  `admin_id` VARCHAR(64) NOT NULL,
  `passwd` VARCHAR(32) NOT NULL,
  `is_deleted` CHAR(1) NOT NULL,
  `by_whom` VARCHAR(64) NOT NULL,
  `insert_time` DATETIME NOT NULL DEFAULT NOW(),
  `delete_time` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `admin` VALUES ('steve', 'd541bcab84d9478c22c4a4cf1ec0ab95', 'N', 'steve', NOW(), '1970-01-01 00:00:00');
