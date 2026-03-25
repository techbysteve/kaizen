ALTER TABLE `users` ADD `username` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `users` ADD `profile_photo_data_url` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `onboarding_completed` integer DEFAULT false NOT NULL;
--> statement-breakpoint
UPDATE `users`
SET
	`username` = COALESCE((
		SELECT `value`
		FROM `settings`
		WHERE `settings`.`user_id` = `users`.`id` AND `settings`.`key` = 'username'
	), ''),
	`profile_photo_data_url` = COALESCE(
		(
			SELECT `value`
			FROM `settings`
			WHERE `settings`.`user_id` = `users`.`id` AND `settings`.`key` = 'profilePhotoDataUrl'
		),
		(
			SELECT `value`
			FROM `settings`
			WHERE `settings`.`user_id` = `users`.`id` AND `settings`.`key` = 'profile_photo_data_url'
		)
	),
	`onboarding_completed` = CASE
		WHEN COALESCE(
			(
				SELECT `value`
				FROM `settings`
				WHERE `settings`.`user_id` = `users`.`id` AND `settings`.`key` = 'onboardingCompleted'
			),
			(
				SELECT `value`
				FROM `settings`
				WHERE `settings`.`user_id` = `users`.`id` AND `settings`.`key` = 'onboarding_completed'
			)
		) IN ('true', '1') THEN 1
		ELSE 0
	END;
