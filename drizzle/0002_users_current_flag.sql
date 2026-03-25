ALTER TABLE `users` ADD `is_current` integer DEFAULT false NOT NULL;
UPDATE `users`
SET `is_current` = 1
WHERE `id` IN (
	SELECT `id`
	FROM `users`
	WHERE `deleted_at` IS NULL
	ORDER BY `created_at` ASC
	LIMIT 1
);
