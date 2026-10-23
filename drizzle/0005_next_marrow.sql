CREATE TABLE `contents` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`channel` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contents_slug_unique` ON `contents` (`slug`);--> statement-breakpoint
CREATE TABLE `followups` (
	`id` text PRIMARY KEY NOT NULL,
	`phone` text NOT NULL,
	`kind` text NOT NULL,
	`booking_id` text,
	`due_date` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	`done_at` text
);
--> statement-breakpoint
CREATE INDEX `followups_phone_idx` ON `followups` (`phone`);--> statement-breakpoint
CREATE TABLE `touches` (
	`id` text PRIMARY KEY NOT NULL,
	`content_slug` text NOT NULL,
	`channel` text NOT NULL,
	`path` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `touches_content_idx` ON `touches` (`content_slug`);--> statement-breakpoint
ALTER TABLE `bookings` ADD `attended_at` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `source_channel` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `source_content` text;--> statement-breakpoint
ALTER TABLE `prescreenings` ADD `source_channel` text;--> statement-breakpoint
ALTER TABLE `prescreenings` ADD `source_content` text;