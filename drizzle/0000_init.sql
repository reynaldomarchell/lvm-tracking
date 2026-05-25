CREATE TABLE `merchants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_name` text,
	`business_type` text,
	`phone` text,
	`email` text,
	`address` text,
	`lat` real,
	`lng` real,
	`status` text DEFAULT 'lead' NOT NULL,
	`pain_points` text,
	`current_bank` text,
	`current_merchant_app` text,
	`customer_needs` text,
	`referrals` text,
	`livin_registered_at` integer,
	`percepatan` integer DEFAULT false,
	`merchant_active_at` integer,
	`delivery_requested_at` integer,
	`delivered_at` integer,
	`created_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`id` text PRIMARY KEY NOT NULL,
	`merchant_id` text NOT NULL,
	`visited_at` integer DEFAULT (unixepoch()) NOT NULL,
	`visited_by` text,
	`action` text,
	`notes` text NOT NULL,
	`voice_transcript` text,
	`extracted` text,
	FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON UPDATE no action ON DELETE cascade
);
