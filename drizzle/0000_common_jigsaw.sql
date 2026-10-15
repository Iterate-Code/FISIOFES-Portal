CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` integer NOT NULL,
	`slot_id` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`cancellation_token` text NOT NULL,
	`credit_refunded` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`cancelled_at` text,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`slot_id`) REFERENCES `class_slots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_cancellation_token_unique` ON `bookings` (`cancellation_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `bookings_client_slot_unique` ON `bookings` (`client_id`,`slot_id`);--> statement-breakpoint
CREATE TABLE `class_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`service` text NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`starts_at` text NOT NULL,
	`capacity` integer NOT NULL,
	`booked_count` integer DEFAULT 0 NOT NULL,
	`instructor` text,
	`cancelled` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`access_pin_hash` text DEFAULT '' NOT NULL,
	`plan_service` text DEFAULT 'pilates' NOT NULL,
	`credits_total` integer DEFAULT 0 NOT NULL,
	`credits_remaining` integer DEFAULT 0 NOT NULL,
	`plan_expires_at` text DEFAULT '1970-01-01' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_phone_unique` ON `clients` (`phone`);