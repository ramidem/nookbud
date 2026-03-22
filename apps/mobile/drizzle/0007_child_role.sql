-- Migration 0007: Add role column to children table
-- Role represents the caregiver's relationship to a specific child
-- (father, mother, step-parent, guardian, etc.)

ALTER TABLE `children` ADD COLUMN `role` text;
