-- Add image_url to messages if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'image_url') THEN
        ALTER TABLE messages ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Ensure General room exists
INSERT INTO chat_rooms (id, name, is_group, created_by)
VALUES ('00000000-0000-0000-0000-000000000000', 'General', true, auth.uid())
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Chat Rooms
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access" ON chat_rooms;
CREATE POLICY "Public read access" ON chat_rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create rooms" ON chat_rooms;
CREATE POLICY "Users can create rooms" ON chat_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS Policies for Room Participants
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants can view their rooms" ON room_participants;
CREATE POLICY "Participants can view their rooms" ON room_participants FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can join rooms" ON room_participants;
CREATE POLICY "Users can join rooms" ON room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave rooms" ON room_participants;
CREATE POLICY "Users can leave rooms" ON room_participants FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their rooms" ON messages;
CREATE POLICY "Users can view messages in their rooms" ON messages FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM room_participants
        WHERE room_participants.room_id = messages.room_id
        AND room_participants.user_id = auth.uid()
    )
    OR 
    -- Allow viewing messages in General room even if not explicitly joined (optional, but good for preview)
    room_id = '00000000-0000-0000-0000-000000000000'
);

DROP POLICY IF EXISTS "Users can insert messages" ON messages;
CREATE POLICY "Users can insert messages" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);
