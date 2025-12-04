-- Fix RLS Policies for Communities, Market Items, and Messages

-- COMMUNITIES
-- Allow everyone to view communities
create policy "Communities are viewable by everyone" 
on communities for select 
using (true);

-- Allow authenticated users to create communities
create policy "Authenticated users can create communities" 
on communities for insert 
with check (auth.role() = 'authenticated');

-- MARKET ITEMS
-- Allow everyone to view market items
create policy "Market items are viewable by everyone" 
on market_items for select 
using (true);

-- Allow authenticated users to create market items
create policy "Authenticated users can create market items" 
on market_items for insert 
with check (auth.role() = 'authenticated');

-- MESSAGES
-- Allow authenticated users to view messages (in a real app, restrict to room members)
create policy "Authenticated users can view messages" 
on messages for select 
using (auth.role() = 'authenticated');

-- Allow authenticated users to insert messages
create policy "Authenticated users can insert messages" 
on messages for insert 
with check (auth.role() = 'authenticated');

-- CHAT ROOMS
-- Enable RLS (if not already)
alter table chat_rooms enable row level security;

-- Allow authenticated users to view chat rooms
create policy "Authenticated users can view chat rooms" 
on chat_rooms for select 
using (auth.role() = 'authenticated');

-- Allow authenticated users to create chat rooms
create policy "Authenticated users can create chat rooms" 
on chat_rooms for insert 
with check (auth.role() = 'authenticated');
