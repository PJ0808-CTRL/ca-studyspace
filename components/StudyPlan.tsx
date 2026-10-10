"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { foundationSyllabus, syllabusSource } from "@/lib/syllabus";
import { subjects, type Flashcard, type RevisionSchedule, type StudyTask, type SyllabusProgress } from "@/lib/types";
import type { Subject } from "@/lib/subjects";

type Tab = "today" | "syllabus" | "revisions" | "flashcards";
type ChapterStatus = SyllabusProgress["status"];

const today = () => new Date().toLocaleDateString("en-CA");
const addDays = (days: number) => { const date = new Date(); date.setDate(date.getDate() + days); return date.toLocaleDateString("en-CA"); };
const revisionIntervals = [1, 3, 7, 15, 30];
const statusLabels: Record<ChapterStatus, string> = { not_started: "Not started", learning: "Learning", revising: "Revising", complete: "Completed" };

export default function StudyPlan({ supabase, userId }: { supabase: SupabaseClient; userId: string }) {
  const [tab, setTab] = useState<Tab>("today");
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [progress, setProgress] = useState<SyllabusProgress[]>([]);
  const [revisions, setRevisions] = useState<RevisionSchedule[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [setupRequired, setSetupRequired] = useState(false);
  const [subject, setSubject] = useState<Subject>("Accounting");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskMinutes, setTaskMinutes] = useState(25);
  const [taskDate, setTaskDate] = useState(today());
  const [flashSubject, setFlashSubject] = useState<Subject>("Accounting");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(""); setSetupRequired(false);
    const [taskResult, progressResult, revisionResult, flashcardResult] = await Promise.all([
      supabase.from("study_tasks").select("*").order("due_date").order("created_at"),
      supabase.from("syllabus_progress").select("*"),
      supabase.from("revision_schedules").select("*").order("next_review_date"),
      supabase.from("flashcards").select("*").order("created_at", { ascending: false }),
    ]);
    const failure = [taskResult, progressResult, revisionResult, flashcardResult].find(result => result.error)?.error;
    if (failure) {
      if (["42P01", "PGRST205"].includes(failure.code || "")) setSetupRequired(true);
      else setError(failure.message);
    } else {
      setTasks((taskResult.data || []) as StudyTask[]);
      setProgress((progressResult.data || []) as SyllabusProgress[]);
      setRevisions((revisionResult.data || []) as RevisionSchedule[]);
      setFlashcards((flashcardResult.data || []) as Flashcard[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { void load(); }, [load]);

  async function createTask(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const { error: saveError } = await supabase.from("study_tasks").insert({ user_id: userId, subject, title: taskTitle.trim(), planned_minutes: taskMinutes, due_date: taskDate });
    if (saveError) setError(saveError.message); else { setTaskTitle(""); await load(); window.dispatchEvent(new Event("ca-study-tasks-updated")); }
    setBusy(false);
  }

  async function toggleTask(task: StudyTask) {
    const completed = !task.completed;
    const { error: saveError } = await supabase.from("study_tasks").update({ completed, completed_at: completed ? new Date().toISOString() : null }).eq("id", task.id);
    if (saveError) setError(saveError.message); else { await load(); window.dispatchEvent(new Event("ca-study-tasks-updated")); }
  }

  async function deleteTask(id: string) {
    const { error: deleteError } = await supabase.from("study_tasks").delete().eq("id", id);
    if (deleteError) setError(deleteError.message); else { await load(); window.dispatchEvent(new Event("ca-study-tasks-updated")); }
  }

  async function updateChapter(chapterKey: string, chapterTitle: string, nextStatus: ChapterStatus) {
    setError("");
    const previous = progress.find(item => item.chapter_key === chapterKey)?.status || "not_started";
    const { error: saveError } = await supabase.from("syllabus_progress").upsert({ user_id: userId, subject, chapter_key: chapterKey, status: nextStatus, updated_at: new Date().toISOString() }, { onConflict: "user_id,chapter_key" });
    if (saveError) { setError(saveError.message); return; }
    if (nextStatus === "complete" && previous !== "complete") {
      const { error: revisionError } = await supabase.from("revision_schedules").upsert({ user_id: userId, subject, topic: chapterTitle, stage: 0, next_review_date: addDays(1), active: true, last_reviewed_at: null }, { onConflict: "user_id,subject,topic" });
      if (revisionError) { setError(revisionError.message); return; }
    }
    await load();
  }

  async function finishRevision(revision: RevisionSchedule) {
    const nextStage = revision.stage + 1;
    const finished = nextStage >= revisionIntervals.length;
    const { error: saveError } = await supabase.from("revision_schedules").update({ stage: nextStage, active: !finished, next_review_date: finished ? revision.next_review_date : addDays(revisionIntervals[nextStage]), last_reviewed_at: new Date().toISOString() }).eq("id", revision.id);
    if (saveError) setError(saveError.message); else await load();
  }

  async function createFlashcard(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const { error: saveError } = await supabase.from("flashcards").insert({ user_id: userId, subject: flashSubject, front: front.trim(), back: back.trim() });
    if (saveError) setError(saveError.message); else { setFront(""); setBack(""); setCardIndex(0); setRevealed(false); await load(); }
    setBusy(false);
  }

  async function deleteFlashcard(id: string) {
    const { error: deleteError } = await supabase.from("flashcards").delete().eq("id", id);
    if (deleteError) setError(deleteError.message); else { setCardIndex(0); setRevealed(false); await load(); }
  }

  const todaysTasks = tasks.filter(task => task.due_date === today());
  const upcomingTasks = tasks.filter(task => task.due_date !== today() && !task.completed).slice(0, 6);
  const allChapters = Object.values(foundationSyllabus).flat();
  const completeCount = progress.filter(item => item.status === "complete").length;
  const syllabusPercent = Math.round(completeCount / allChapters.length * 100);
  const dueRevisions = revisions.filter(item => item.active && item.next_review_date <= today());
  const filteredCards = flashcards.filter(card => card.subject === flashSubject);
  const activeCard = filteredCards.length ? filteredCards[Math.min(cardIndex, filteredCards.length - 1)] : null;

  function moveCard(direction: number) {
    if (!filteredCards.length) return;
    setCardIndex(index => (index + direction + filteredCards.length) % filteredCards.length);
    setRevealed(false);
  }

  if (setupRequired) return <><header className="page-head"><p className="eyebrow">STUDY SYSTEM</p><h1>Your plan, from today to exam day.</h1><p>Daily tasks, syllabus coverage, revision cycles, and flashcards in one connected workspace.</p></header><section className="card planning-setup"><span>ONE-TIME SETUP</span><h2>Enable the new planning tools</h2><p>Open <code>supabase/migrations/20261010_study_planning.sql</code>, copy the full file into your Supabase SQL Editor, and run it once. Then refresh this page.</p><button className="primary" onClick={() => void load()}>I ran the migration — retry</button></section></>;

  return <><header className="page-head"><p className="eyebrow">STUDY SYSTEM</p><h1>Your plan, from today to exam day.</h1><p>Daily tasks, syllabus coverage, revision cycles, and flashcards in one connected workspace.</p></header><div className="planning-stats"><div><span>TODAY</span><strong>{todaysTasks.filter(item => item.completed).length}/{todaysTasks.length}</strong><small>tasks complete</small></div><div><span>SYLLABUS</span><strong>{syllabusPercent}%</strong><small>{completeCount} chapters complete</small></div><div><span>REVISIONS DUE</span><strong>{dueRevisions.length}</strong><small>need your attention</small></div><div><span>FLASHCARDS</span><strong>{flashcards.length}</strong><small>in your deck</small></div></div><nav className="planning-tabs" aria-label="Study planning tools">{([['today','Today'],['syllabus','Syllabus'],['revisions','Revisions'],['flashcards','Flashcards']] as [Tab,string][]).map(([id,label]) => <button className={tab === id ? "active" : ""} onClick={() => setTab(id)} key={id}>{label}{id === "revisions" && dueRevisions.length > 0 && <i>{dueRevisions.length}</i>}</button>)}</nav>{loading && <div className="sync">Loading your study plan…</div>}{error && <div className="notice error-text">{error}</div>}{tab === "today" && <div className="planner-grid"><section className="card"><div className="section-title"><div><p className="eyebrow">ADD TO YOUR DAY</p><h3>Plan a study task</h3></div></div><form className="form-stack" onSubmit={createTask}><label>Subject<select value={subject} onChange={event => setSubject(event.target.value as Subject)}>{subjects.map(item => <option key={item}>{item}</option>)}</select></label><label>Task<input value={taskTitle} onChange={event => setTaskTitle(event.target.value)} maxLength={120} placeholder="e.g. Revise Contract Act units 1–3" required /></label><div className="form-pair"><label>Planned minutes<input type="number" min={5} max={720} step={5} value={taskMinutes} onChange={event => setTaskMinutes(Number(event.target.value))} required /></label><label>Study date<input type="date" value={taskDate} onChange={event => setTaskDate(event.target.value)} required /></label></div><button className="primary" disabled={busy}>Add to plan →</button></form></section><section className="card task-board"><div className="section-title"><div><p className="eyebrow">TODAY · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" }).toUpperCase()}</p><h3>Your focus list</h3></div><span>{todaysTasks.reduce((sum, item) => sum + item.planned_minutes, 0)} min planned</span></div>{todaysTasks.length ? <div className="task-list">{todaysTasks.map(task => <div className={`plan-task ${task.completed ? "done" : ""}`} key={task.id}><button className="task-check" onClick={() => void toggleTask(task)} aria-label={task.completed ? "Mark incomplete" : "Mark complete"}>{task.completed ? "✓" : ""}</button><div><strong>{task.title}</strong><small>{task.subject} · {task.logged_minutes}/{task.planned_minutes} min focused</small><div className="task-progress"><i style={{ width: `${Math.min(100, task.logged_minutes / task.planned_minutes * 100)}%` }} /></div></div><button className="danger-link" onClick={() => void deleteTask(task.id)}>Remove</button></div>)}</div> : <div className="planner-empty"><b>Your day is open.</b><p>Add one clear task on the left and give it a place in your plan.</p></div>}{upcomingTasks.length > 0 && <div className="upcoming-list"><span>COMING UP</span>{upcomingTasks.map(task => <div key={task.id}><b>{new Date(`${task.due_date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</b><p>{task.title}</p><small>{task.subject}</small></div>)}</div>}</section></div>}{tab === "syllabus" && <section className="card syllabus-panel"><div className="syllabus-head"><div><p className="eyebrow">ICAI FOUNDATION · MAY 2026 ONWARDS</p><h3>Syllabus tracker</h3><p>Move each chapter through learning, revision, and completion. Completing a chapter schedules its five revisions automatically.</p></div><select value={subject} onChange={event => setSubject(event.target.value as Subject)}>{subjects.map(item => <option key={item}>{item}</option>)}</select></div><div className="subject-progress"><div><i style={{ width: `${Math.round(progress.filter(item => item.subject === subject && item.status === "complete").length / foundationSyllabus[subject].length * 100)}%` }} /></div><span>{progress.filter(item => item.subject === subject && item.status === "complete").length} of {foundationSyllabus[subject].length} chapters completed</span></div><div className="chapter-list">{foundationSyllabus[subject].map((chapter, index) => { const current = progress.find(item => item.chapter_key === chapter.key)?.status || "not_started"; return <div className="chapter-row" key={chapter.key}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{chapter.title}</strong>{chapter.part && <small>{chapter.part}</small>}</div><select className={`status-${current}`} value={current} onChange={event => void updateChapter(chapter.key, chapter.title, event.target.value as ChapterStatus)}>{(Object.keys(statusLabels) as ChapterStatus[]).map(status => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></div>; })}</div><a className="syllabus-source" href={syllabusSource} target="_blank" rel="noopener noreferrer">View official ICAI Foundation syllabus ↗</a></section>}{tab === "revisions" && <section className="card revision-panel"><div className="section-title"><div><p className="eyebrow">SPACED REVISION · 1–3–7–15–30</p><h3>Revision calendar</h3></div><span>{dueRevisions.length} due today</span></div>{revisions.filter(item => item.active).length ? <div className="revision-list">{revisions.filter(item => item.active).map(revision => { const due = revision.next_review_date <= today(); return <div className={`revision-row ${due ? "due" : ""}`} key={revision.id}><div className="revision-date"><strong>{new Date(`${revision.next_review_date}T12:00:00`).toLocaleDateString("en-IN", { day: "2-digit" })}</strong><small>{new Date(`${revision.next_review_date}T12:00:00`).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}</small></div><div><span>{revision.subject}</span><strong>{revision.topic}</strong><small>Revision {Math.min(revision.stage + 1, 5)} of 5 · {revisionIntervals[revision.stage]}-day interval</small></div><button className={due ? "primary" : "text-button"} onClick={() => void finishRevision(revision)}>{due ? "Mark revised ✓" : "Review early"}</button></div>; })}</div> : <div className="planner-empty"><b>No revisions scheduled yet.</b><p>Mark a syllabus chapter as completed and its 1–3–7–15–30 day revision cycle will appear here.</p></div>}</section>}{tab === "flashcards" && <div className="planner-grid flashcard-grid"><section className="card"><div className="section-title"><div><p className="eyebrow">BUILD YOUR DECK</p><h3>Create a flashcard</h3></div></div><form className="form-stack" onSubmit={createFlashcard}><label>Subject<select value={flashSubject} onChange={event => { setFlashSubject(event.target.value as Subject); setCardIndex(0); setRevealed(false); }}>{subjects.map(item => <option key={item}>{item}</option>)}</select></label><label>Front<textarea rows={3} value={front} onChange={event => setFront(event.target.value)} maxLength={500} placeholder="Question, formula, section, or key term" required /></label><label>Back<textarea rows={5} value={back} onChange={event => setBack(event.target.value)} maxLength={1500} placeholder="Answer or explanation in your own words" required /></label><button className="primary" disabled={busy}>Add flashcard →</button></form></section><section className="card deck-panel"><div className="section-title"><div><p className="eyebrow">{flashSubject.toUpperCase()}</p><h3>Review your deck</h3></div><span>{filteredCards.length} cards</span></div>{activeCard ? <><button className={`study-card ${revealed ? "revealed" : ""}`} onClick={() => setRevealed(value => !value)}><small>{revealed ? "ANSWER" : "QUESTION"}</small><strong>{revealed ? activeCard.back : activeCard.front}</strong><span>{revealed ? "Click to see the question" : "Think first, then reveal"}</span></button><div className="deck-actions"><button onClick={() => moveCard(-1)}>← Previous</button><span>{Math.min(cardIndex + 1, filteredCards.length)} / {filteredCards.length}</span><button onClick={() => moveCard(1)}>Next →</button></div><button className="danger-link deck-delete" onClick={() => void deleteFlashcard(activeCard.id)}>Delete this card</button></> : <div className="planner-empty"><b>Your {flashSubject} deck is empty.</b><p>Create your first card on the left. Short prompts and answers work best.</p></div>}</section></div>}</>;
}
