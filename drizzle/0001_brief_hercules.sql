CREATE TABLE `prescreenings` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`answers` text NOT NULL,
	`route` text NOT NULL,
	`red_flags` text DEFAULT '[]' NOT NULL,
	`recommended_slug` text NOT NULL,
	`questionnaire_version` integer NOT NULL,
	`consent_at` text NOT NULL,
	`contacted` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
