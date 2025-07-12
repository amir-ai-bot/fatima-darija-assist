-- Add image column to chat_messages table for storing base64 image data
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS image TEXT;

-- Add reaction column to chat_messages table for storing emoji reactions
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS reaction TEXT; 