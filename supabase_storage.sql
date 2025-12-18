-- Enable the storage extension if not already enabled (usually enabled by default)
-- create extension if not exists "storage" schema "extensions";

-- 1. Create Buckets
insert into storage.buckets (id, name, public)
values 
  ('avatars', 'avatars', true),
  ('post-images', 'post-images', true),
  ('chat-attachments', 'chat-attachments', true)
on conflict (id) do nothing;

-- 2. RLS Policies for 'avatars'
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update their own avatar."
  on storage.objects for update
  using ( bucket_id = 'avatars' );

-- 3. RLS Policies for 'post-images'
create policy "Post images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'post-images' );

create policy "Authenticated users can upload post images."
  on storage.objects for insert
  with check ( bucket_id = 'post-images' and auth.role() = 'authenticated' );

-- 4. RLS Policies for 'chat-attachments'
create policy "Chat attachments are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'chat-attachments' );

create policy "Authenticated users can upload chat attachments."
  on storage.objects for insert
  with check ( bucket_id = 'chat-attachments' and auth.role() = 'authenticated' );
