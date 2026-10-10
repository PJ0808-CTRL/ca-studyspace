-- Run once in Supabase Dashboard -> SQL Editor.
-- All student data is protected with Row Level Security.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 50),
  exam_date date,
  goal_minutes integer not null default 120 check (goal_minutes between 15 and 720),
  created_at timestamptz not null default now()
);

create table if not exists public.study_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('Accounting','Business Laws','Quantitative Aptitude','Business Economics')),
  topic text not null check (char_length(topic) between 1 and 120),
  minutes integer not null check (minutes between 1 and 1440),
  study_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('Accounting','Business Laws','Quantitative Aptitude','Business Economics')),
  title text not null check (char_length(title) between 1 and 120),
  content text not null default '' check (char_length(content) <= 5000),
  file_path text unique,
  file_name text,
  file_mime text,
  file_size integer,
  shared boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notes_body_or_file_check check (char_length(btrim(content)) > 0 or file_path is not null),
  constraint notes_file_owner_check check (file_path is null or split_part(file_path, '/', 1) = user_id::text),
  constraint notes_file_metadata_check check (file_path is null or (file_name is not null and file_mime is not null and file_size between 1 and 10485760))
);

create table if not exists public.discussions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  subject text not null check (subject in ('Accounting','Business Laws','Quantitative Aptitude','Business Economics')),
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  discussion_id uuid not null references public.discussions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 1200),
  created_at timestamptz not null default now()
);

create table if not exists public.room_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  room text not null check (room in ('General','Accounting','Business Laws','Quantitative Aptitude','Business Economics')),
  author_name text not null,
  body text not null check (char_length(body) between 1 and 700),
  created_at timestamptz not null default now()
);

create table if not exists public.test_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('Quantitative Aptitude','Business Economics')),
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists study_logs_user_date on public.study_logs(user_id, study_date desc);
create index if not exists room_messages_room_date on public.room_messages(room, created_at desc);
create index if not exists discussions_date on public.discussions(created_at desc);
create index if not exists notes_shared_subject_date on public.notes(subject, created_at desc) where shared;
create index if not exists replies_discussion_date on public.replies(discussion_id, created_at);
create index if not exists attempts_user_date on public.test_attempts(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.study_logs enable row level security;
alter table public.notes enable row level security;
alter table public.discussions enable row level security;
alter table public.replies enable row level security;
alter table public.room_messages enable row level security;
alter table public.test_attempts enable row level security;

grant select, insert, update, delete on public.profiles, public.study_logs, public.notes,
  public.discussions, public.replies, public.room_messages, public.test_attempts to authenticated;

create policy "profile owner read" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profile owner insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profile owner update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "log owner read" on public.study_logs for select to authenticated using ((select auth.uid()) = user_id);
create policy "log owner insert" on public.study_logs for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "log owner update" on public.study_logs for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "log owner delete" on public.study_logs for delete to authenticated using ((select auth.uid()) = user_id);

create policy "note owner or shared read" on public.notes for select to authenticated using ((select auth.uid()) = user_id or shared = true);
create policy "note owner insert" on public.notes for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "note owner update" on public.notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "note owner delete" on public.notes for delete to authenticated using ((select auth.uid()) = user_id);

create policy "discussions read" on public.discussions for select to authenticated using (true);
create policy "discussions insert" on public.discussions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "discussions owner delete" on public.discussions for delete to authenticated using ((select auth.uid()) = user_id);

create policy "replies read" on public.replies for select to authenticated using (true);
create policy "replies insert" on public.replies for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "replies owner delete" on public.replies for delete to authenticated using ((select auth.uid()) = user_id);

create policy "messages read" on public.room_messages for select to authenticated using (true);
create policy "messages insert" on public.room_messages for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "messages owner delete" on public.room_messages for delete to authenticated using ((select auth.uid()) = user_id);

create policy "attempts owner read" on public.test_attempts for select to authenticated using ((select auth.uid()) = user_id);
create policy "attempts owner insert" on public.test_attempts for insert to authenticated with check ((select auth.uid()) = user_id);

-- Enable live Postgres Changes for chat. Supabase's project already has this publication.
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'room_messages') then
    execute 'alter publication supabase_realtime add table public.room_messages';
  end if;
end $$;

-- Private documents: students can upload their own files and read shared notes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('study-notes', 'study-notes', false, 10485760,
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "study notes upload" on storage.objects for insert to authenticated
with check (bucket_id = 'study-notes' and exists (
  select 1 from public.notes n where n.file_path = name and n.user_id = (select auth.uid())
));
create policy "study notes download" on storage.objects for select to authenticated
using (bucket_id = 'study-notes' and exists (
  select 1 from public.notes n where n.file_path = name and (n.user_id = (select auth.uid()) or n.shared)
));
create policy "study notes delete" on storage.objects for delete to authenticated
using (bucket_id = 'study-notes' and exists (
  select 1 from public.notes n where n.file_path = name and n.user_id = (select auth.uid())
));
