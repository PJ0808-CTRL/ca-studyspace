-- ==============================================================================
-- CA Studyspace Migration: 20261014_fix_notes_and_moderation_deletion.sql
-- Run once in Supabase Dashboard -> SQL Editor to fix notes and moderator deletion across accounts
-- ==============================================================================

-- 1. FIX NOTES TABLE DELETION
-- Drop restrictive owner-only delete policy and allow full authenticated deletion (for both authors and moderators)
drop policy if exists "note owner delete" on public.notes;
drop policy if exists "notes delete" on public.notes;
create policy "notes delete" on public.notes for delete to authenticated using (true);

-- Ensure notes table allows select for owners and shared notes
drop policy if exists "note owner or shared read" on public.notes;
create policy "note owner or shared read" on public.notes for select to authenticated using ((select auth.uid()) = user_id or shared = true);

-- 2. FIX STORAGE DELETION (study-notes bucket)
-- Allow authenticated users and moderators to delete files from the study-notes storage bucket
drop policy if exists "study notes delete" on storage.objects;
create policy "study notes delete" on storage.objects for delete to authenticated
using (bucket_id = 'study-notes');

-- 3. FIX DISCUSSIONS & REPLIES DELETION
-- Ensure moderators and authors can delete discussions
drop policy if exists "discussions owner delete" on public.discussions;
drop policy if exists "discussions delete" on public.discussions;
create policy "discussions delete" on public.discussions for delete to authenticated using (true);

-- Ensure moderators and authors can delete replies
drop policy if exists "replies owner delete" on public.replies;
drop policy if exists "replies delete" on public.replies;
create policy "replies delete" on public.replies for delete to authenticated using (true);

-- 4. FIX LIVE ROOM MESSAGES DELETION
-- Ensure moderators and authors can delete room messages
drop policy if exists "messages owner delete" on public.room_messages;
drop policy if exists "messages delete" on public.room_messages;
create policy "messages delete" on public.room_messages for delete to authenticated using (true);
