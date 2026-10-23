ALTER TABLE `bookings` ADD `calendar_event_id` text;--> statement-breakpoint
ALTER TABLE `bookings` ADD `calendar_sync` text DEFAULT 'none' NOT NULL;