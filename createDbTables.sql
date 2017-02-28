
-- DROP DATABASE `db000`;

CREATE DATABASE `db000` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `db`;

CREATE TABLE `access` (
  `ip_addr` VARCHAR(16) NOT NULL,
  `ip_desc` VARCHAR(255) NOT NULL,
  `admin_id` VARCHAR(64) NOT NULL,
  `insert_time` DATETIME NOT NULL DEFAULT NOW(),
  `update_time` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`ip_addr`)
);

INSERT INTO `access` VALUES ('1.1.1.*', 'HOME', 'steve', NOW(), NOW());

CREATE TABLE `admin` (
  `admin_id` VARCHAR(64) NOT NULL,
  `passwd` VARCHAR(32) NOT NULL,
  `insert_by` VARCHAR(64) NOT NULL,
  `insert_time` DATETIME NOT NULL DEFAULT NOW(),
  `update_by` VARCHAR(64) NOT NULL,
  `update_time` DATETIME NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`admin_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `admin` VALUES ('steve', 'd541bcab84d9478c22c4a4cf1ec0ab95', 'steve', NOW(), 'steve', NOW());
