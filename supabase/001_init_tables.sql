-- Enable the pgcrypto extension for UUID generation
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────────
-- Table: rooms (public/group chat channels)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.rooms (
  id         uuid                default gen_random_uuid() primary key,
  name       text                not null unique,
  is_public  boolean             default true,
  created_at timestamp with time zone default now()
);

-- ────────────────────────────────────────────────────────────────
-- Table: messages (public/group chat messages)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id         uuid                default gen_random_uuid() primary key,
  content    text                not null,
  room_id    uuid                references public.rooms(id) on delete cascade,
  user_id    uuid                references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- RLS policy for messages: only owners can insert
alter table public.messages enable row level security;
create policy "Allow public message insert" on public.messages
  for insert
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- Table: profiles (user metadata for discovery)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid                primary key references auth.users(id) on delete cascade,
  username   text,
  is_public  boolean             default false,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- RLS policy for profiles: user can upsert their own
alter table public.profiles enable row level security;
create policy "Allow profile upsert by owner" on public.profiles
  for insert, update
  with check (auth.uid() = id);

-- ────────────────────────────────────────────────────────────────
-- Table: private_chats (one‐to‐one chat channels)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.private_chats (
  id         uuid                default gen_random_uuid() primary key,
  user1_id   uuid                references auth.users(id) on delete cascade,
  user2_id   uuid                references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- ────────────────────────────────────────────────────────────────
-- Table: private_messages (one‐to‐one chat messages)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.private_messages (
  id         uuid                default gen_random_uuid() primary key,
  chat_id    uuid                references public.private_chats(id) on delete cascade,
  sender_id  uuid                references auth.users(id) on delete cascade,
  content    text                not null,
  created_at timestamp with time zone default now()
);

-- RLS policy for private_messages: only sender can insert
alter table public.private_messages enable row level security;
create policy "Allow private message insert" on public.private_messages
  for insert
  with check (auth.uid() = sender_id);
