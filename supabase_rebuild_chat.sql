-- 🚨 DESTRUCTIVE OPERATION: Drops existing chat tables
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS room_participants CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;

-- 1. Create chat_rooms table
CREATE TABLE chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT, -- Nullable for DMs (display name generated dynamically)
    is_group BOOLEAN DEFAULT false,
    image_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message JSONB -- Store preview: { content: "...", sender: "...", time: "..." }
);

-- 2. Create room_participants table
CREATE TABLE room_participants (
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (room_id, user_id)
);

-- 3. Create messages table
CREATE TABLE messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT,
    image_url TEXT,
    reply_to UUID REFERENCES messages(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 5. Policies for chat_rooms

-- Users can view rooms they are in (or General)
CREATE POLICY "View rooms" ON chat_rooms FOR SELECT
USING (
    id = '00000000-0000-0000-0000-000000000000' -- General
    OR
    EXISTS (
        SELECT 1 FROM room_participants
        WHERE room_participants.room_id = chat_rooms.id
        AND room_participants.user_id = auth.uid()
    )
);

-- Users can create rooms
CREATE POLICY "Create rooms" ON chat_rooms FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Users can update rooms they are in (e.g. update last_message)
CREATE POLICY "Update rooms" ON chat_rooms FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM room_participants
        WHERE room_participants.room_id = chat_rooms.id
        AND room_participants.user_id = auth.uid()
    )
);

-- 6. Policies for room_participants

-- Users can view participants of rooms they are in
CREATE POLICY "View participants" ON room_participants FOR SELECT
USING (
    room_id = '00000000-0000-0000-0000-000000000000' -- Anyone can see General participants
    OR
    user_id = auth.uid() -- Can see self
    OR
    EXISTS ( -- Can see others in shared rooms
        SELECT 1 FROM room_participants rp
        WHERE rp.room_id = room_participants.room_id
        AND rp.user_id = auth.uid()
    )
);

-- Users can join rooms (insert self)
CREATE POLICY "Join rooms" ON room_participants FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own read status
CREATE POLICY "Update own participant" ON room_participants FOR UPDATE
USING (user_id = auth.uid());

-- Users can leave rooms
CREATE POLICY "Leave rooms" ON room_participants FOR DELETE
USING (user_id = auth.uid());


-- 7. Policies for messages

-- Users can view messages in rooms they are in
CREATE POLICY "View messages" ON messages FOR SELECT
USING (
    room_id = '00000000-0000-0000-0000-000000000000'
    OR
    EXISTS (
        SELECT 1 FROM room_participants
        WHERE room_participants.room_id = messages.room_id
        AND room_participants.user_id = auth.uid()
    )
);

-- Users can insert messages in rooms they are in
CREATE POLICY "Insert messages" ON messages FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND (
        room_id = '00000000-0000-0000-0000-000000000000'
        OR
        EXISTS (
            SELECT 1 FROM room_participants
            WHERE room_participants.room_id = messages.room_id
            AND room_participants.user_id = auth.uid()
        )
    )
);

-- 8. Functions

-- Function to update updated_at on messages
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE PROCEDURE handle_updated_at();

-- Function to auto-update room's last_message
CREATE OR REPLACE FUNCTION update_room_last_message()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.user_id;

    UPDATE chat_rooms
    SET 
        last_message = jsonb_build_object(
            'content', CASE WHEN NEW.image_url IS NOT NULL THEN 'Sent an image' ELSE NEW.content END,
            'sender', sender_name,
            'time', NEW.created_at
        ),
        updated_at = NOW()
    WHERE id = NEW.room_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_room_last_message
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE PROCEDURE update_room_last_message();

-- 9. Re-create General Room
INSERT INTO chat_rooms (id, name, is_group, created_by)
VALUES ('00000000-0000-0000-0000-000000000000', 'General', true, auth.uid())
ON CONFLICT (id) DO NOTHING;
