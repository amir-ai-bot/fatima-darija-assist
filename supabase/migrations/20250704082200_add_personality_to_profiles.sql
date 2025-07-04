-- Add personality column to profiles table
ALTER TABLE public.profiles
ADD COLUMN personality TEXT DEFAULT 'friendly_warm' NOT NULL;

-- Add a check constraint for allowed personalities
ALTER TABLE public.profiles
ADD CONSTRAINT personality_check CHECK (personality IN ('friendly_warm', 'funny_sassy', 'wise_calm'));