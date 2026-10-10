import type { Subject } from "./subjects";

export type Profile = { id: string; display_name: string; exam_date: string | null; goal_minutes: number };
export type StudyLog = { id: string; user_id: string; subject: Subject; topic: string; minutes: number; study_date: string; created_at: string };
export type Note = { id: string; user_id: string; subject: Subject; title: string; content: string; shared: boolean; file_path: string | null; file_name: string | null; file_mime: string | null; file_size: number | null; created_at: string };
export type Discussion = { id: string; user_id: string; author_name: string; subject: Subject; title: string; body: string; created_at: string };
export type Reply = { id: string; discussion_id: string; user_id: string; author_name: string; body: string; created_at: string };
export type RoomMessage = { id: string; user_id: string; room: string; author_name: string; body: string; created_at: string };
export type StudyTask = { id: string; user_id: string; subject: Subject; title: string; planned_minutes: number; logged_minutes: number; due_date: string; completed: boolean; completed_at: string | null; created_at: string };
export type SyllabusProgress = { id: string; user_id: string; subject: Subject; chapter_key: string; status: "not_started" | "learning" | "revising" | "complete"; updated_at: string };
export type RevisionSchedule = { id: string; user_id: string; subject: Subject; topic: string; stage: number; next_review_date: string; active: boolean; last_reviewed_at: string | null; created_at: string };
export type Flashcard = { id: string; user_id: string; subject: Subject; front: string; back: string; created_at: string; updated_at: string };

export const subjects: Subject[] = ["Accounting", "Business Laws", "Quantitative Aptitude", "Business Economics"];
export const rooms = ["General", ...subjects];
