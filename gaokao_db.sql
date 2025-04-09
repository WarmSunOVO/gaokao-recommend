/*
 Navicat Premium Dump SQL

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 90200 (9.2.0)
 Source Host           : localhost:3306
 Source Schema         : gaokao_db

 Target Server Type    : MySQL
 Target Server Version : 90200 (9.2.0)
 File Encoding         : 65001

 Date: 09/04/2025 16:06:52
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for admission_plans
-- ----------------------------
DROP TABLE IF EXISTS `admission_plans`;
CREATE TABLE `admission_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `university_id` int NOT NULL COMMENT '大学ID (关联 universities 表)',
  `major_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '专业名称',
  `year` int NOT NULL COMMENT '招生年份',
  `batch` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '录取批次',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '招生类别 (如 普通类)',
  `plan_count` int DEFAULT NULL COMMENT '计划招生人数',
  `subject_group` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '一级学科/专业组名称 (可选)',
  `subject_requirements` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '选科要求 (可选, 如 物理+化学)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_uni_year` (`university_id`,`year`),
  CONSTRAINT `admission_plans_ibfk_1` FOREIGN KEY (`university_id`) REFERENCES `universities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='招生计划表';

-- ----------------------------
-- Records of admission_plans
-- ----------------------------
BEGIN;
INSERT INTO `admission_plans` (`id`, `university_id`, `major_name`, `year`, `batch`, `category`, `plan_count`, `subject_group`, `subject_requirements`, `created_at`) VALUES (1, 1, '无机非金属材料工程', 2023, '专科(高职)', '普通类', 3, '土木建筑大类', NULL, '2025-04-09 14:09:47');
INSERT INTO `admission_plans` (`id`, `university_id`, `major_name`, `year`, `batch`, `category`, `plan_count`, `subject_group`, `subject_requirements`, `created_at`) VALUES (2, 1, '建筑工程技术', 2023, '专科(高职)', '普通类', 3, '土木建筑大类', NULL, '2025-04-09 14:09:47');
INSERT INTO `admission_plans` (`id`, `university_id`, `major_name`, `year`, `batch`, `category`, `plan_count`, `subject_group`, `subject_requirements`, `created_at`) VALUES (3, 1, '工程造价', 2023, '专科(高职)', '普通类', 3, '土木建筑大类', NULL, '2025-04-09 14:09:47');
INSERT INTO `admission_plans` (`id`, `university_id`, `major_name`, `year`, `batch`, `category`, `plan_count`, `subject_group`, `subject_requirements`, `created_at`) VALUES (4, 1, '数控技术', 2023, '专科(高职)', '普通类', 2, '装备制造大类', NULL, '2025-04-09 14:09:47');
INSERT INTO `admission_plans` (`id`, `university_id`, `major_name`, `year`, `batch`, `category`, `plan_count`, `subject_group`, `subject_requirements`, `created_at`) VALUES (5, 2, '软件工程', 2023, '本科批', '普通类', 50, '计算机类', NULL, '2025-04-09 14:09:47');
INSERT INTO `admission_plans` (`id`, `university_id`, `major_name`, `year`, `batch`, `category`, `plan_count`, `subject_group`, `subject_requirements`, `created_at`) VALUES (6, 3, '交通运输类', 2023, '本科批', '普通类', 100, '交通运输类', NULL, '2025-04-09 14:09:47');
COMMIT;

-- ----------------------------
-- Table structure for control_lines
-- ----------------------------
DROP TABLE IF EXISTS `control_lines`;
CREATE TABLE `control_lines` (
  `id` int NOT NULL AUTO_INCREMENT,
  `province` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '省份',
  `year` int NOT NULL COMMENT '年份',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '考生类别 (如 综合, 体育类, 艺术类)',
  `batch` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '批次名称 (如 本科批, 专科批, 特殊类型)',
  `score` int NOT NULL COMMENT '分数线',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_province_year` (`province`,`year`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='省控线数据表';

-- ----------------------------
-- Records of control_lines
-- ----------------------------
BEGIN;
INSERT INTO `control_lines` (`id`, `province`, `year`, `category`, `batch`, `score`, `created_at`) VALUES (1, '北京', 2022, '综合', '本科批', 425, '2025-04-09 14:09:33');
INSERT INTO `control_lines` (`id`, `province`, `year`, `category`, `batch`, `score`, `created_at`) VALUES (2, '北京', 2022, '综合', '特殊类型招生控制线', 518, '2025-04-09 14:09:33');
INSERT INTO `control_lines` (`id`, `province`, `year`, `category`, `batch`, `score`, `created_at`) VALUES (3, '北京', 2022, '综合', '专科批', 120, '2025-04-09 14:09:33');
INSERT INTO `control_lines` (`id`, `province`, `year`, `category`, `batch`, `score`, `created_at`) VALUES (4, '北京', 2022, '综合', '体育类（本科）', 348, '2025-04-09 14:09:33');
INSERT INTO `control_lines` (`id`, `province`, `year`, `category`, `batch`, `score`, `created_at`) VALUES (5, '北京', 2022, '综合', '艺术类（本科）', 319, '2025-04-09 14:09:33');
INSERT INTO `control_lines` (`id`, `province`, `year`, `category`, `batch`, `score`, `created_at`) VALUES (6, '北京', 2022, '综合', '艺术类（高职专科）', 84, '2025-04-09 14:09:33');
INSERT INTO `control_lines` (`id`, `province`, `year`, `category`, `batch`, `score`, `created_at`) VALUES (7, '上海', 2022, '综合', '本科批', 400, '2025-04-09 14:09:33');
INSERT INTO `control_lines` (`id`, `province`, `year`, `category`, `batch`, `score`, `created_at`) VALUES (8, '上海', 2022, '综合', '特殊类型招生控制线', 503, '2025-04-09 14:09:33');
COMMIT;

-- ----------------------------
-- Table structure for majors
-- ----------------------------
DROP TABLE IF EXISTS `majors`;
CREATE TABLE `majors` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '专业唯一ID',
  `university_id` int NOT NULL COMMENT '所属大学ID',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '专业名称',
  `plan_count` int DEFAULT NULL COMMENT '计划招生人数 (可选)',
  `admission_rank_min` int NOT NULL COMMENT '最低录取位次 (关键字段)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `university_id` (`university_id`),
  CONSTRAINT `majors_ibfk_1` FOREIGN KEY (`university_id`) REFERENCES `universities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='专业信息表';

-- ----------------------------
-- Records of majors
-- ----------------------------
BEGIN;
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (1, 1, '护理学', 17, 3500, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (2, 1, '医学技术类', 4, 4800, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (3, 1, '基础医学', 17, 4900, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (4, 2, '化学类', 6, 5000, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (5, 2, '工科试验班', 4, 5100, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (6, 2, '理科试验班', 4, 5200, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (7, 3, '外国语言文学类', 3, 4200, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (8, 3, '法学', 2, 4300, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (9, 3, '土木类', 1, 5500, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (10, 4, '生物科学类', 2, 3000, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (11, 4, '电子信息类', 2, 3500, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (12, 4, '计算机类', 2, 3600, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (13, 5, '经济学类', 10, 1000, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
INSERT INTO `majors` (`id`, `university_id`, `name`, `plan_count`, `admission_rank_min`, `created_at`, `updated_at`) VALUES (14, 5, '计算机科学与技术', 8, 1500, '2025-04-07 17:43:18', '2025-04-07 17:43:18');
COMMIT;

-- ----------------------------
-- Table structure for score_rank_data
-- ----------------------------
DROP TABLE IF EXISTS `score_rank_data`;
CREATE TABLE `score_rank_data` (
  `id` int NOT NULL AUTO_INCREMENT,
  `province` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '省份',
  `year` int NOT NULL COMMENT '年份',
  `score` int NOT NULL COMMENT '分数',
  `count` int NOT NULL COMMENT '本段人数',
  `cumulative_count` int NOT NULL COMMENT '累计人数',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_entry` (`province`,`year`,`score`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='一分一段数据表';

-- ----------------------------
-- Records of score_rank_data
-- ----------------------------
BEGIN;
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (1, '北京', 2022, 700, 106, 106, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (2, '北京', 2022, 699, 18, 124, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (3, '北京', 2022, 698, 13, 137, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (4, '北京', 2022, 697, 15, 152, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (5, '北京', 2022, 696, 21, 173, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (6, '北京', 2022, 695, 21, 194, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (7, '北京', 2022, 694, 22, 216, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (8, '北京', 2022, 693, 25, 241, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (9, '北京', 2022, 692, 20, 261, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (10, '北京', 2022, 691, 27, 288, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (11, '北京', 2022, 690, 29, 317, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (12, '北京', 2022, 689, 33, 350, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (13, '上海', 2022, 650, 50, 50, '2025-04-09 14:19:20');
INSERT INTO `score_rank_data` (`id`, `province`, `year`, `score`, `count`, `cumulative_count`, `created_at`) VALUES (14, '上海', 2022, 649, 15, 65, '2025-04-09 14:19:20');
COMMIT;

-- ----------------------------
-- Table structure for universities
-- ----------------------------
DROP TABLE IF EXISTS `universities`;
CREATE TABLE `universities` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '大学唯一ID',
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '大学名称',
  `tags` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标签 (如 985,211,双一流)，逗号分隔',
  `province` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '所在省份',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='大学信息表';

-- ----------------------------
-- Records of universities
-- ----------------------------
BEGIN;
INSERT INTO `universities` (`id`, `name`, `tags`, `province`, `created_at`, `updated_at`) VALUES (1, '北京大学医学部', '985,211,双一流', '北京', '2025-04-07 17:42:51', '2025-04-07 17:42:51');
INSERT INTO `universities` (`id`, `name`, `tags`, `province`, `created_at`, `updated_at`) VALUES (2, '厦门大学', '985,211,双一流', '福建', '2025-04-07 17:42:51', '2025-04-07 17:42:51');
INSERT INTO `universities` (`id`, `name`, `tags`, `province`, `created_at`, `updated_at`) VALUES (3, '北京交通大学', '211,双一流', '北京', '2025-04-07 17:42:51', '2025-04-07 17:42:51');
INSERT INTO `universities` (`id`, `name`, `tags`, `province`, `created_at`, `updated_at`) VALUES (4, '山东大学', '985,211,双一流', '山东', '2025-04-07 17:42:51', '2025-04-07 17:42:51');
INSERT INTO `universities` (`id`, `name`, `tags`, `province`, `created_at`, `updated_at`) VALUES (5, '复旦大学', '985,211,双一流', '上海', '2025-04-07 17:42:51', '2025-04-07 17:42:51');
COMMIT;

-- ----------------------------
-- Table structure for user_favorites
-- ----------------------------
DROP TABLE IF EXISTS `user_favorites`;
CREATE TABLE `user_favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL COMMENT '用户ID (关联 users 表)',
  `item_id` int NOT NULL COMMENT '收藏项的ID (大学ID或专业ID)',
  `item_type` enum('university','major') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收藏项的类型',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`user_id`,`item_id`,`item_type`),
  KEY `idx_user_type` (`user_id`,`item_type`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- ----------------------------
-- Records of user_favorites
-- ----------------------------
BEGIN;
INSERT INTO `user_favorites` (`id`, `user_id`, `item_id`, `item_type`, `created_at`) VALUES (2, 4, 4, 'major', '2025-04-09 10:46:04');
INSERT INTO `user_favorites` (`id`, `user_id`, `item_id`, `item_type`, `created_at`) VALUES (5, 4, 3, 'university', '2025-04-09 13:55:43');
INSERT INTO `user_favorites` (`id`, `user_id`, `item_id`, `item_type`, `created_at`) VALUES (7, 4, 2, 'university', '2025-04-09 13:55:45');
INSERT INTO `user_favorites` (`id`, `user_id`, `item_id`, `item_type`, `created_at`) VALUES (8, 4, 1, 'university', '2025-04-09 14:12:15');
INSERT INTO `user_favorites` (`id`, `user_id`, `item_id`, `item_type`, `created_at`) VALUES (9, 4, 5, 'major', '2025-04-09 14:24:28');
COMMIT;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `account` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_card` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account` (`account`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of users
-- ----------------------------
BEGIN;
INSERT INTO `users` (`id`, `account`, `phone`, `password`, `name`, `gender`, `id_card`, `avatar_url`, `created_at`, `updated_at`) VALUES (1, '123123', '13859403213', '$2b$10$HYcwEX/3a.A/8h0AwO7xdulq2aqG.LyIVhgFTH1Y4UrZoSktBduNG', NULL, NULL, NULL, NULL, '2025-04-07 16:58:04', '2025-04-07 16:58:04');
INSERT INTO `users` (`id`, `account`, `phone`, `password`, `name`, `gender`, `id_card`, `avatar_url`, `created_at`, `updated_at`) VALUES (2, '1234', '13829384231', '$2b$10$LRrg2J5E5ZDluUZgWrina.ll.IAcmJsoLWi92JNhnVuYiAb5uJOzC', NULL, NULL, NULL, NULL, '2025-04-07 23:39:10', '2025-04-07 23:39:10');
INSERT INTO `users` (`id`, `account`, `phone`, `password`, `name`, `gender`, `id_card`, `avatar_url`, `created_at`, `updated_at`) VALUES (3, '12345', '13982938421', '$2b$10$R3.isXUMjm/xL84nCLt2i.BTXADSIprLl5sRdI22NwmgjdMrCzWxm', NULL, NULL, NULL, NULL, '2025-04-07 23:44:57', '2025-04-07 23:44:57');
INSERT INTO `users` (`id`, `account`, `phone`, `password`, `name`, `gender`, `id_card`, `avatar_url`, `created_at`, `updated_at`) VALUES (4, '112233', '13859340234', '$2b$10$OACyNUUDp0tHYhYOIoPywe1ottHNPIUjinfEDHPBaQbhIs6YyvpZK', NULL, NULL, NULL, NULL, '2025-04-09 10:32:20', '2025-04-09 10:32:20');
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
