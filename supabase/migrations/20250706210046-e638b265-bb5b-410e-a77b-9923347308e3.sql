-- Add description field to profiles table for AI personalization
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS description TEXT;

-- Create subscribers table for subscription management
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  subscribed BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT,
  subscription_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on subscribers table
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for subscribers table
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "update_own_subscription" ON public.subscribers
FOR UPDATE
USING (true);

CREATE POLICY "insert_subscription" ON public.subscribers
FOR INSERT
WITH CHECK (true);

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for profile photos
CREATE POLICY "Profile photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile photo" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile photo" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile photo" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profiles' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update profiles trigger to handle new description field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, description)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'), 'New user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;