CREATE TABLE `client_jobs` (
	`clientId` integer NOT NULL,
	`jobId` integer NOT NULL,
	`createdAt` text DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	PRIMARY KEY(`clientId`, `jobId`),
	FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`apiKey` text NOT NULL,
	`createdAt` text DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	`updatedAt` text DEFAULT '1970-01-01T00:00:00.000Z' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_apiKey_unique` ON `clients` (`apiKey`);