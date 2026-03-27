-- Fix display_name NOT NULL constraint and add missing columns
ALTER TABLE public.users ALTER COLUMN display_name DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN display_name SET DEFAULT '';

-- Add first_name, last_name, middle_name, role if they don't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS middle_name text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role text;
