import type { Subject } from "./questions";

export type Profile = { id: string; display_name: string; exam_date: string | null; goal_minutes: number };
export type StudyLog = { id: string; user_id: string; subject: Subject; topic: string; minutes: number; study_date: string; created_at: string };
export type Note = { id: string; user_id: string; subject: Subject; title: string; content: string; shared: boolean; file_path: string | null; file_name: string | null; file_mime: string | null; file_size: number | null; created_at: string };
export type Discussion = { id: string; user_id: string; author_name: string; subject: Subject; title: string; body: string; created_at: string };
export type Reply = { id: string; discussion_id: string; user_id: string; author_name: string; body: string; created_at: string };
export type RoomMessage = { id: string; user_id: string; room: string; author_name: string; body: string; created_at: string };
export type Attempt = { id: string; user_id: string; subject: Subject; score: number; total: number; answers: { id: string; selected: number | null; correct: number; explanation: string }[]; created_at: string };
export type QuizQuestion = { id: string; subject: Subject; topic: string; prompt: string; options: string[] };

export const subjects: Subject[] = ["Accounting", "Business Laws", "Quantitative Aptitude", "Business Economics"];
export const rooms = ["General", ...subjects];
