-- Run this once in the Supabase SQL Editor for an existing CA Studyspace project.
-- It keeps all existing text notes and adds private PDF/Word storage.

alter table public.notes add column if not exists file_path text;
alter table public.notes add column if not exists file_name text;
alter table public.notes add column if not exists file_mime text;
alter table public.notes add column if not exists file_size integer;
alter table public.notes alter column content set default '';
alter table public.notes drop constraint if exists notes_content_check;
alter table public.notes drop constraint if exists notes_body_or_file_check;
alter table public.notes drop constraint if exists notes_file_owner_check;
alter table public.notes drop constraint if exists notes_file_metadata_check;
alter table public.notes add constraint notes_content_length_check check (char_length(content) <= 5000);
alter table public.notes add constraint notes_body_or_file_check check (char_length(btrim(content)) > 0 or file_path is not null);
alter table public.notes add constraint notes_file_owner_check check (file_path is null or split_part(file_path, '/', 1) = user_id::text);
alter table public.notes add constraint notes_file_metadata_check check (file_path is null or (file_name is not null and file_mime is not null and file_size between 1 and 10485760));

create unique index if not exists notes_file_path_unique on public.notes(file_path) where file_path is not null;
create index if not exists notes_shared_subject_date on public.notes(subject, created_at desc) where shared;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('study-notes', 'study-notes', false, 10485760,
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'study notes upload') then
    create policy "study notes upload" on storage.objects for insert to authenticated
    with check (bucket_id = 'study-notes' and exists (
      select 1 from public.notes n where n.file_path = name and n.user_id = (select auth.uid())
    ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'study notes download') then
    create policy "study notes download" on storage.objects for select to authenticated
    using (bucket_id = 'study-notes' and exists (
      select 1 from public.notes n where n.file_path = name and (n.user_id = (select auth.uid()) or n.shared)
    ));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'study notes delete') then
    create policy "study notes delete" on storage.objects for delete to authenticated
    using (bucket_id = 'study-notes' and exists (
      select 1 from public.notes n where n.file_path = name and n.user_id = (select auth.uid())
    ));
  end if;
end $$;
