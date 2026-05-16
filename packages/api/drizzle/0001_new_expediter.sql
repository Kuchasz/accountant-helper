CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sql_server_connections` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`server` text NOT NULL,
	`database` text NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	`port` integer DEFAULT 1433 NOT NULL,
	`encrypt` integer DEFAULT true NOT NULL,
	`trust_server_certificate` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `sql_server_connections_name_unique` ON `sql_server_connections` (`name`);