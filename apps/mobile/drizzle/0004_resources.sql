CREATE TABLE `resources` (
  `id` text PRIMARY KEY NOT NULL,
  `space_id` text NOT NULL,
  `child_id` text,
  `title` text NOT NULL,
  `description` text,
  `category` text NOT NULL,
  `file_hash` text NOT NULL,
  `storage_path` text NOT NULL,
  `original_filename` text NOT NULL,
  `file_size_bytes` integer NOT NULL,
  `mime_type` text NOT NULL,
  `uploaded_by` text NOT NULL,
  `created_at` integer NOT NULL,
  `deleted_at` integer,
  FOREIGN KEY (`space_id`) REFERENCES `spaces`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`child_id`) REFERENCES `children`(`id`) ON UPDATE no action ON DELETE no action,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
