-- Create spaces table
CREATE TABLE `spaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`emoji` text DEFAULT '🏠' NOT NULL,
	`color` text DEFAULT '#6F8F7B' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- Create space_members table
CREATE TABLE `space_members` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL DEFAULT 'parent',
	`joined_at` integer NOT NULL,
	`invited_by` text,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- Migrate existing relationships → spaces
INSERT INTO `spaces` (`id`, `name`, `emoji`, `color`, `created_by`, `created_at`, `updated_at`)
SELECT `id`, 'My Space', '🏠', '#6F8F7B', `parent_a_id`, `created_at`, `created_at`
FROM `relationships`;
--> statement-breakpoint
-- Migrate parent_a as owner
INSERT INTO `space_members` (`id`, `space_id`, `user_id`, `role`, `joined_at`)
SELECT 'sm-a-' || `id`, `id`, `parent_a_id`, 'owner', `created_at`
FROM `relationships`;
--> statement-breakpoint
-- Migrate parent_b as parent (where exists)
INSERT INTO `space_members` (`id`, `space_id`, `user_id`, `role`, `joined_at`, `invited_by`)
SELECT 'sm-b-' || `id`, `id`, `parent_b_id`, 'parent', `created_at`, `parent_a_id`
FROM `relationships`
WHERE `parent_b_id` IS NOT NULL;
--> statement-breakpoint
-- Recreate children table with space_id instead of relationship_id
CREATE TABLE `children_new` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`name` text NOT NULL,
	`date_of_birth` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `children_new` SELECT `id`, `relationship_id`, `name`, `date_of_birth`, `created_at` FROM `children`;
--> statement-breakpoint
DROP TABLE `children`;
--> statement-breakpoint
ALTER TABLE `children_new` RENAME TO `children`;
--> statement-breakpoint
-- Recreate entries table with space_id instead of relationship_id
CREATE TABLE `entries_new` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`child_id` text,
	`type` text NOT NULL,
	`created_by` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`current_version_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `entries_new` SELECT `id`, `relationship_id`, `child_id`, `type`, `created_by`, `status`, `current_version_id`, `created_at` FROM `entries`;
--> statement-breakpoint
DROP TABLE `entries`;
--> statement-breakpoint
ALTER TABLE `entries_new` RENAME TO `entries`;
--> statement-breakpoint
-- Drop relationships table (data migrated)
DROP TABLE `relationships`;
