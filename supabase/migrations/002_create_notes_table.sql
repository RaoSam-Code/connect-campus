-- Create notes table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  tags text[] default '{}',
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.notes enable row level security;

-- Policy: Only owner can SELECT/INSERT/UPDATE/DELETE
create policy "Notes: owner can select" on public.notes
  for select using (user_id = auth.uid());

create policy "Notes: owner can insert" on public.notes
  for insert with check (user_id = auth.uid());

create policy "Notes: owner can update" on public.notes
  for update using (user_id = auth.uid());

create policy "Notes: owner can delete" on public.notes
  for delete using (user_id = auth.uid());
