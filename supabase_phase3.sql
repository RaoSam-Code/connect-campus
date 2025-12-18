-- 1. CHAT ROOMS
create table if not exists chat_rooms (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_group boolean default false,
  name text -- Optional for DMs, required for groups
);

alter table chat_rooms enable row level security;

-- 2. ROOM PARTICIPANTS
create table if not exists room_participants (
  room_id uuid references chat_rooms(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (room_id, user_id)
);

alter table room_participants enable row level security;

-- 3. MESSAGES (Update or Create)
-- We might already have a 'messages' table from the basic chat. 
-- Let's check and modify or create.
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text,
  user_id uuid references profiles(id) on delete cascade not null,
  room_id uuid references chat_rooms(id) on delete cascade, -- Make nullable for backward compat if needed, but ideally required
  image_url text
);

alter table messages enable row level security;

-- POLICIES

-- Participants can view their rooms
create policy "Users can view rooms they are in"
  on chat_rooms for select
  using (
    exists (
      select 1 from room_participants
      where room_participants.room_id = chat_rooms.id
      and room_participants.user_id = auth.uid()
    )
  );

-- Participants can insert rooms (usually done via function, but allow for now)
create policy "Users can create rooms"
  on chat_rooms for insert
  with check (true);

-- Participants can view members of their rooms
create policy "Users can view participants of their rooms"
  on room_participants for select
  using (
    exists (
      select 1 from room_participants rp
      where rp.room_id = room_participants.room_id
      and rp.user_id = auth.uid()
    )
  );

create policy "Users can join rooms"
  on room_participants for insert
  with check (auth.uid() = user_id); -- Or logic for adding others

-- Messages are viewable by room participants
drop policy if exists "Public messages are viewable by everyone" on messages; -- Remove old policy
create policy "Room participants can view messages"
  on messages for select
  using (
    exists (
      select 1 from room_participants
      where room_participants.room_id = messages.room_id
      and room_participants.user_id = auth.uid()
    )
  );

create policy "Room participants can insert messages"
  on messages for insert
  with check (
    exists (
      select 1 from room_participants
      where room_participants.room_id = messages.room_id
      and room_participants.user_id = auth.uid()
    )
  );

-- Helper function to create a DM room
create or replace function create_dm_room(other_user_id uuid)
returns uuid as $$
declare
  new_room_id uuid;
begin
  -- Check if DM already exists
  select r.id into new_room_id
  from chat_rooms r
  join room_participants rp1 on r.id = rp1.room_id
  join room_participants rp2 on r.id = rp2.room_id
  where r.is_group = false
  and rp1.user_id = auth.uid()
  and rp2.user_id = other_user_id;

  -- If exists, return it
  if new_room_id is not null then
    return new_room_id;
  end if;

  -- Create new room
  insert into chat_rooms (is_group) values (false) returning id into new_room_id;

  -- Add participants
  insert into room_participants (room_id, user_id) values (new_room_id, auth.uid());
  insert into room_participants (room_id, user_id) values (new_room_id, other_user_id);

  return new_room_id;
end;
$$ language plpgsql security definer;
