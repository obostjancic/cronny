CREATE TABLE `jobs` (
	`id` integer PRIMARY KEY NOT NULL,
	`strategy` text NOT NULL,
	`name` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`cron` text NOT NULL,
	`params` blob,
	`notify` blob
);
--> statement-breakpoint
CREATE TABLE `runs` (
	`id` integer PRIMARY KEY NOT NULL,
	`jobId` integer NOT NULL,
	`start` text NOT NULL,
	`end` text,
	`status` text NOT NULL,
	`results` blob,
	FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
