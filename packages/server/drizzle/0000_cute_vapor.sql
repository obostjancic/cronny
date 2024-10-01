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
CREATE TABLE `results` (
	`id` integer PRIMARY KEY NOT NULL,
	`createdAt` text DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	`updatedAt` text DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	`internalId` text NOT NULL,
	`runId` integer NOT NULL,
	`jobId` integer NOT NULL,
	`data` blob NOT NULL,
	`status` text NOT NULL,
	`isHidden` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`runId`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `runs` (
	`id` integer PRIMARY KEY NOT NULL,
	`jobId` integer NOT NULL,
	`start` text NOT NULL,
	`end` text,
	`status` text NOT NULL,
	FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
