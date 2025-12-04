-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  university text,
  major text,
  year text,
  interests text[], -- Array of strings
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COMMUNITIES
create table communities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  category text,
  location text,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COMMUNITY MEMBERS
create table community_members (
  community_id uuid references communities(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (community_id, user_id)
);

-- POSTS (Feed)
create table posts (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  image_url text,
  user_id uuid references profiles(id) on delete cascade not null,
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MARKETPLACE ITEMS
create table market_items (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  price numeric not null,
  image_url text,
  condition text,
  seller_id uuid references profiles(id) on delete cascade not null,
  status text default 'available', -- available, sold, pending
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CHAT ROOMS (Direct Messages & Groups)
create table chat_rooms (
  id uuid default uuid_generate_v4() primary key,
  name text, -- Null for DMs
  is_group boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CHAT PARTICIPANTS
create table chat_participants (
  room_id uuid references chat_rooms(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (room_id, user_id)
);

-- MESSAGES
create table messages (
  id uuid default uuid_generate_v4() primary key,
  room_id uuid references chat_rooms(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS POLICIES (Basic Security)
alter table profiles enable row level security;
alter table communities enable row level security;
alter table posts enable row level security;
alter table market_items enable row level security;
alter table messages enable row level security;

-- Profiles: Public read, Self update
create policy "Public profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Posts: Public read, Auth create
create policy "Posts are viewable by everyone" on posts for select using (true);
create policy "Authenticated users can create posts" on posts for insert with check (auth.role() = 'authenticated');

-- Realtime
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table posts;
