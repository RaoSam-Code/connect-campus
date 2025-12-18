-- Drop existing policies to ensure we have a clean slate
drop policy if exists "Public profiles are viewable by everyone" on profiles;
drop policy if exists "Users can update own profile" on profiles;

-- Recreate them with correct permissions
create policy "Public profiles are viewable by everyone"
on profiles for select
using ( true );

create policy "Users can update own profile"
on profiles for update
using ( auth.uid() = id );
