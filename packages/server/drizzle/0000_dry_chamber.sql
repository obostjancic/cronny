CREATE TABLE `runs` (
	`id` integer PRIMARY KEY NOT NULL,
	`job` text NOT NULL,
	`start` text NOT NULL,
	`end` text,
	`status` text NOT NULL,
	`params` blob NOT NULL,
	`config` blob NOT NULL,
	`results` blob
);
