-- 1. POST LIKES
create table post_likes (
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, post_id)
);

alter table post_likes enable row level security;

create policy "Public post likes are viewable by everyone" 
  on post_likes for select using (true);

create policy "Authenticated users can toggle likes" 
  on post_likes for insert 
  with check (auth.uid() = user_id);

create policy "Users can remove their own likes" 
  on post_likes for delete 
  using (auth.uid() = user_id);

-- 2. COMMENTS
create table comments (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table comments enable row level security;

create policy "Public comments are viewable by everyone" 
  on comments for select using (true);

create policy "Authenticated users can create comments" 
  on comments for insert 
  with check (auth.role() = 'authenticated');

create policy "Users can delete their own comments" 
  on comments for delete 
  using (auth.uid() = user_id);

-- 3. REALTIME
alter publication supabase_realtime add table post_likes;
alter publication supabase_realtime add table comments;
