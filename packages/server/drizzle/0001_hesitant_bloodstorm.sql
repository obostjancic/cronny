CREATE TABLE `results` (
	`id` integer PRIMARY KEY NOT NULL,
	`internalId` text NOT NULL,
	`runId` integer NOT NULL,
	`jobId` integer NOT NULL,
	`data` blob NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`runId`) REFERENCES `runs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE no action
);
