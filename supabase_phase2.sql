-- 1. COMMUNITY MEMBERS
create table if not exists community_members (
  community_id uuid references communities(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('admin', 'moderator', 'member')),
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (community_id, user_id)
);

alter table community_members enable row level security;

-- Policies (drop first to avoid duplicates)
drop policy if exists "Public community members are viewable by everyone" on community_members;
create policy "Public community members are viewable by everyone" 
  on community_members for select using (true);

drop policy if exists "Authenticated users can join communities" on community_members;
create policy "Authenticated users can join communities" 
  on community_members for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can leave communities" on community_members;
create policy "Users can leave communities" 
  on community_members for delete 
  using (auth.uid() = user_id);

-- 2. UPDATE POSTS FOR COMMUNITIES
do $$ 
begin 
    if not exists (select 1 from information_schema.columns where table_name = 'posts' and column_name = 'community_id') then
        alter table posts add column community_id uuid references communities(id) on delete set null;
    end if;
end $$;

-- 3. UPDATE COMMUNITIES STATS
create or replace function get_community_member_count(community_id uuid)
returns integer as $$
  select count(*) from community_members where community_id = $1;
$$ language sql stable;
