-- Add email and name columns to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS name text;

-- Update existing records to populate email and name from profiles
UPDATE public.user_roles ur
SET 
  email = p.email,
  name = p.full_name
FROM public.profiles p
WHERE ur.user_id = p.id
  AND (ur.email IS NULL OR ur.name IS NULL);