-- Migration 0009: Fix display_name NOT NULL constraint
-- SQLite cannot drop NOT NULL from existing columns, so we recreate the users table
-- with display_name removed and first_name/last_name as the canonical name fields.

PRAGMA foreign_keys = OFF;
--> statement-breakpoint

CREATE TABLE `users_new` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text,
  `first_name` text NOT NULL DEFAULT '',
  `middle_name` text,
  `last_name` text NOT NULL DEFAULT '',
  `role` text,
  `timezone` text NOT NULL DEFAULT 'UTC',
  `default_currency` text NOT NULL DEFAULT 'USD',
  `created_at` integer NOT NULL
);
--> statement-breakpoint

INSERT INTO `users_new` 
  SELECT id, email, first_name, middle_name, last_name, role, timezone, default_currency, created_at
  FROM `users`;
--> statement-breakpoint

DROP TABLE `users`;
--> statement-breakpoint

ALTER TABLE `users_new` RENAME TO `users`;
--> statement-breakpoint

PRAGMA foreign_keys = ON;
