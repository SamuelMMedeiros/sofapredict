CREATE TABLE `api_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cache_key` varchar(255) NOT NULL,
	`source` enum('rapidapi','gemini','sofascore'),
	`data` json,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_cache_cache_key_unique` UNIQUE(`cache_key`)
);
--> statement-breakpoint
CREATE TABLE `lgpd_consent_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`consent_type` enum('data_processing','marketing','analytics'),
	`consent_given` boolean,
	`ip_address` varchar(45),
	`user_agent` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lgpd_consent_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_bets_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`composite_odds` decimal(10,2) NOT NULL,
	`invested_amount` decimal(10,2) NOT NULL,
	`projected_return` decimal(10,2) NOT NULL,
	`actual_return` decimal(10,2),
	`status` enum('pending','won','lost','cancelled') NOT NULL,
	`selections` json,
	`notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`settled_at` timestamp,
	CONSTRAINT `user_bets_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`favorite_teams` json,
	`oled_mode_active` boolean NOT NULL DEFAULT false,
	`sound_alerts_active` boolean NOT NULL DEFAULT true,
	`rapidapi_key` text,
	`lgpd_consent_given` boolean DEFAULT false,
	`lgpd_consent_date` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `user_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_bets` int NOT NULL DEFAULT 0,
	`won_bets` int NOT NULL DEFAULT 0,
	`lost_bets` int NOT NULL DEFAULT 0,
	`win_rate` decimal(5,2) DEFAULT '0.00',
	`roi` decimal(8,2) DEFAULT '0.00',
	`total_invested` decimal(12,2) DEFAULT '0.00',
	`total_returned` decimal(12,2) DEFAULT '0.00',
	`current_streak` int NOT NULL DEFAULT 0,
	`best_streak` int NOT NULL DEFAULT 0,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_stats_user_id_unique` UNIQUE(`user_id`)
);
