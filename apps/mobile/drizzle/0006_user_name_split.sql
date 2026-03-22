-- Migration 0006: Split display_name into first_name, middle_name, last_name
-- Add role column to users table
-- Timezone and currency remain but are now auto-detected (set via settings)

-- Add new columns
ALTER TABLE `users` ADD COLUMN `first_name` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `middle_name` text;
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `last_name` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `role` text;
--> statement-breakpoint

-- Migrate existing display_name → first_name (best effort for existing data)
UPDATE `users` SET `first_name` = `display_name` WHERE `first_name` = '';
