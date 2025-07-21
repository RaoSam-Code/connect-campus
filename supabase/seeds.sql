-- supabase/seeds.sql

-- Seed default public rooms
INSERT INTO public.rooms (name, is_public)
VALUES
  ('general', true),
  ('random', true);

-- (Optional) Seed a demo profile
--INSERT INTO public.profiles (id, username, is_public)
--VALUES
--  ('00000000-0000-0000-0000-000000000001', 'demo', true);
