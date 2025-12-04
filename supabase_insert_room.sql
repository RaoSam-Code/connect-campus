-- Insert the default "General" chat room
insert into chat_rooms (id, name, is_group)
values ('00000000-0000-0000-0000-000000000000', 'General', true)
on conflict (id) do nothing;
