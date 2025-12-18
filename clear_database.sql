-- 🚨 DESTRUCTIVE OPERATION: Clear all data except user profiles
-- Run this in your Supabase SQL Editor

BEGIN;

-- 1. Truncate all tables except profiles
TRUNCATE TABLE 
    messages, 
    room_participants, 
    chat_participants, 
    chat_rooms, 
    post_likes, 
    comments, 
    market_items, 
    posts, 
    community_members, 
    communities
CASCADE;

-- 2. Fix schema relationships if they are pointing to auth.users instead of public.profiles
-- This fixes the "Could not find a relationship between 'messages' and 'profiles'" error

-- Fix messages table
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_user_id_fkey;
ALTER TABLE messages ADD CONSTRAINT messages_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix room_participants table
ALTER TABLE room_participants DROP CONSTRAINT IF EXISTS room_participants_user_id_fkey;
ALTER TABLE room_participants ADD CONSTRAINT room_participants_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Fix chat_rooms table (created_by)
ALTER TABLE chat_rooms DROP CONSTRAINT IF EXISTS chat_rooms_created_by_fkey;
ALTER TABLE chat_rooms ADD CONSTRAINT chat_rooms_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. Recreate the General room (default for the app)
INSERT INTO chat_rooms (id, name, is_group)
VALUES ('00000000-0000-0000-0000-000000000000', 'General', true)
ON CONFLICT (id) DO NOTHING;

COMMIT;
