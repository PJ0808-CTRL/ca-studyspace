-- Run once in Supabase Dashboard -> SQL Editor to enable cloud-synced ranks & leaderboards.

alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists streak integer not null default 0;
alter table public.profiles add column if not exists rank_tier text not null default 'Plastic';

-- Allow authenticated users to view profiles for leaderboard standings
drop policy if exists "profile public leaderboard read" on public.profiles;
create policy "profile public leaderboard read" on public.profiles for select to authenticated using (true);
