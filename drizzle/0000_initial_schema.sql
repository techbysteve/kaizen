CREATE TABLE IF NOT EXISTS `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `extracted_articles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`url` text NOT NULL,
	`title` text,
	`author` text,
	`description` text,
	`published_date` text,
	`content` text NOT NULL,
	`image_url` text,
	`read_time_minutes` integer DEFAULT 0 NOT NULL,
	`read_status` integer DEFAULT false NOT NULL,
	`is_favorite` integer DEFAULT false NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`name_normalized` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `article_tags` (
	`article_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	PRIMARY KEY(`article_id`, `tag_id`, `user_id`),
	FOREIGN KEY (`article_id`) REFERENCES `extracted_articles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `settings` (
	`user_id` text NOT NULL,
	`key` text NOT NULL,
	`value` text,
	PRIMARY KEY(`user_id`, `key`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `extracted_articles_user_url_uidx` ON `extracted_articles` (`user_id`,`url`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `extracted_articles_user_created_at_desc_idx` ON `extracted_articles` (`user_id`, `created_at` DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `extracted_articles_user_read_status_created_at_idx` ON `extracted_articles` (`user_id`,`read_status`, `created_at` DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `extracted_articles_user_favorite_created_at_idx` ON `extracted_articles` (`user_id`, `created_at` DESC) WHERE `is_favorite` = 1;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `extracted_articles_user_archived_created_at_idx` ON `extracted_articles` (`user_id`, `created_at` DESC) WHERE `is_archived` = 1;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `tags_user_name_normalized_uidx` ON `tags` (`user_id`,`name_normalized`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `tags_user_id_idx` ON `tags` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `article_tags_article_id_user_id_idx` ON `article_tags` (`article_id`,`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `article_tags_tag_id_user_id_idx` ON `article_tags` (`tag_id`,`user_id`);
