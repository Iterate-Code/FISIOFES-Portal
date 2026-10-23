CREATE TABLE `appointment_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` integer NOT NULL,
	`service_slug` text NOT NULL,
	`branch` text NOT NULL,
	`schedule` text NOT NULL,
	`preferred_date` text,
	`note` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
