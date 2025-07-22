-- Update the default farming rate to 1.0 TONIX/H
ALTER TABLE public.profiles ALTER COLUMN farming_rate SET DEFAULT 1.0;

-- Update existing users to have 1.0 farming rate if they still have the old default
UPDATE public.profiles SET farming_rate = 1.0 WHERE farming_rate = 10.0;