-- Run once in Supabase SQL Editor for an existing CA Studyspace project.
-- Adds private daily planning, syllabus tracking, spaced revisions and flashcards.

create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('Accounting','Business Laws','Quantitative Aptitude','Business Economics')),
  title text not null check (char_length(title) between 1 and 120),
  planned_minutes integer not null check (planned_minutes between 5 and 720),
  logged_minutes integer not null default 0 check (logged_minutes between 0 and 1440),
  due_date date not null default current_date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.syllabus_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('Accounting','Business Laws','Quantitative Aptitude','Business Economics')),
  chapter_key text not null check (char_length(chapter_key) between 1 and 40),
  status text not null default 'not_started' check (status in ('not_started','learning','revising','complete')),
  updated_at timestamptz not null default now(),
  unique (user_id, chapter_key)
);

create table if not exists public.revision_schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('Accounting','Business Laws','Quantitative Aptitude','Business Economics')),
  topic text not null check (char_length(topic) between 1 and 120),
  stage integer not null default 0 check (stage between 0 and 5),
  next_review_date date not null,
  active boolean not null default true,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, subject, topic)
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null check (subject in ('Accounting','Business Laws','Quantitative Aptitude','Business Economics')),
  front text not null check (char_length(front) between 1 and 500),
  back text not null check (char_length(back) between 1 and 1500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_tasks_user_due on public.study_tasks(user_id, due_date, completed);
create index if not exists revision_schedules_user_due on public.revision_schedules(user_id, next_review_date) where active;
create index if not exists flashcards_user_subject on public.flashcards(user_id, subject, created_at desc);

alter table public.study_tasks enable row level security;
alter table public.syllabus_progress enable row level security;
alter table public.revision_schedules enable row level security;
alter table public.flashcards enable row level security;

grant select, insert, update, delete on public.study_tasks, public.syllabus_progress,
  public.revision_schedules, public.flashcards to authenticated;

create policy "task owner all" on public.study_tasks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "syllabus owner all" on public.syllabus_progress for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "revision owner all" on public.revision_schedules for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "flashcard owner all" on public.flashcards for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
