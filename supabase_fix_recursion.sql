-- Fix Infinite Recursion in RLS Policies

-- 1. Create a secure function to check membership without triggering recursion
-- SECURITY DEFINER allows this function to run with the privileges of the creator (you),
-- avoiding the RLS loop when querying room_participants.
CREATE OR REPLACE FUNCTION is_room_member(_room_id UUID, _user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM room_participants
        WHERE room_id = _room_id
        AND user_id = _user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update room_participants policy to use the non-recursive function
DROP POLICY IF EXISTS "View participants" ON room_participants;
CREATE POLICY "View participants" ON room_participants FOR SELECT
USING (
    room_id = '00000000-0000-0000-0000-000000000000' -- General is public
    OR
    user_id = auth.uid() -- Can always see self
    OR
    is_room_member(room_id, auth.uid()) -- Use the safe function
);

-- 3. Update chat_rooms policy (for consistency and safety)
DROP POLICY IF EXISTS "View rooms" ON chat_rooms;
CREATE POLICY "View rooms" ON chat_rooms FOR SELECT
USING (
    id = '00000000-0000-0000-0000-000000000000' -- General is public
    OR
    is_room_member(id, auth.uid())
);

-- 4. Update messages policy
DROP POLICY IF EXISTS "View messages" ON messages;
CREATE POLICY "View messages" ON messages FOR SELECT
USING (
    room_id = '00000000-0000-0000-0000-000000000000'
    OR
    is_room_member(room_id, auth.uid())
);

-- 5. Update messages insert policy
DROP POLICY IF EXISTS "Insert messages" ON messages;
CREATE POLICY "Insert messages" ON messages FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND (
        room_id = '00000000-0000-0000-0000-000000000000'
        OR
        is_room_member(room_id, auth.uid())
    )
);
