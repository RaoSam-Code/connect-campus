-- Insert the General Chat Room if it doesn't exist
insert into chat_rooms (id, name, is_group)
values ('00000000-0000-0000-0000-000000000000', 'General', true)
on conflict (id) do nothing;

-- Optional: You can run this to add yourself to it manually if needed, 
-- but the frontend will handle auto-joining.
-- insert into room_participants (room_id, user_id) values ('00000000-0000-0000-0000-000000000000', 'YOUR_USER_ID');
