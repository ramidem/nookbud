-- Migration 0008: Create tasks table
-- Collaborative task management for Space members

CREATE TABLE `tasks` (
  `id` text PRIMARY KEY NOT NULL,
  `space_id` text NOT NULL REFERENCES `spaces`(`id`),
  `child_id` text REFERENCES `children`(`id`),
  `title` text NOT NULL,
  `description` text,
  `status` text NOT NULL DEFAULT 'open',
  `priority` text NOT NULL DEFAULT 'medium',
  `assigned_to` text REFERENCES `users`(`id`),
  `created_by` text NOT NULL REFERENCES `users`(`id`),
  `due_date` integer,
  `completed_at` integer,
  `completed_by` text REFERENCES `users`(`id`),
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  `deleted_at` integer
);
