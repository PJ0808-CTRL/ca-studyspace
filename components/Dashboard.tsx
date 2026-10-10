"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subjects, type Attempt, type Profile, type StudyLog } from "@/lib/types";
import type { Subject } from "@/lib/questions";

const today = () => new Date().toLocaleDateString("en-CA");

export default function Dashboard({ supabase, userId, profile, logs, attempts, refresh, goToTests }: { supabase: SupabaseClient; userId: string; profile: Profile; logs: StudyLog[]; attempts: Attempt[]; refresh: () => Promise<void>; goToTests: () => void }) {
  const [subject, setSubject] = useState<Subject>("Accounting");
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const todayMinutes = logs.filter(item => item.study_date === today()).reduce((sum, item) => sum + item.minutes, 0);
  const week = Array.from({ length: 7 }, (_, i) => { const date = new Date(); date.setDate(date.getDate() - 6 + i); const iso = date.toLocaleDateString("en-CA"); return { label: date.toLocaleDateString("en-IN", { weekday: "short" }), minutes: logs.filter(item => item.study_date === iso).reduce((sum, item) => sum + item.minutes, 0) }; });
  const streakDays = new Set(logs.map(item => item.study_date));
  const pointer = new Date(); if (!streakDays.has(today())) pointer.setDate(pointer.getDate() - 1);
  let streak = 0; while (streakDays.has(pointer.toLocaleDateString("en-CA"))) { streak++; pointer.setDate(pointer.getDate() - 1); }
  const goal = profile.goal_minutes || 120;

  async function saveLog(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const { error } = await supabase.from("study_logs").insert({ user_id: userId, subject, topic: topic.trim(), minutes, study_date: today() });
    if (error) setError(error.message); else { setTopic(""); await refresh(); }
    setBusy(false);
  }

  return <><header className="page-head"><p className="eyebrow">YOUR STUDY DESK · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p><h1>Good to see you, {profile.display_name.split(" ")[0]}.</h1><p>Make today count, one topic at a time.</p></header><section className="goal-hero"><div><span>TODAY'S TARGET</span><h2>{todayMinutes} <small>/ {goal} minutes</small></h2><p>{todayMinutes >= goal ? "Daily goal complete. Well done." : `${goal - todayMinutes} minutes to go. Log your next study session below.`}</p><div className="goal-bar"><i style={{ width: `${Math.min(100, todayMinutes / goal * 100)}%` }} /></div></div><div className="hero-number">{Math.min(100, Math.round(todayMinutes / goal * 100))}%<small>completed</small></div></section><div className="stat-grid"><div className="stat"><span>STUDY STREAK</span><strong>{streak} days</strong><small>Keep showing up</small></div><div className="stat"><span>THIS WEEK</span><strong>{Math.round(week.reduce((sum, day) => sum + day.minutes, 0) / 60 * 10) / 10} hours</strong><small>Across all subjects</small></div><div className="stat"><span>TESTS TAKEN</span><strong>{attempts.length}</strong><small>{attempts[0] ? `Latest ${attempts[0].score}/${attempts[0].total}` : "Take your first test"}</small></div></div><div className="dashboard-grid"><section className="card"><div className="section-title"><div><p className="eyebrow">BUILD THE HABIT</p><h3>Log study time</h3></div></div><form className="form-stack" onSubmit={saveLog}><label>Subject<select value={subject} onChange={event => setSubject(event.target.value as Subject)}>{subjects.map(item => <option key={item}>{item}</option>)}</select></label><label>Topic<input value={topic} onChange={event => setTopic(event.target.value)} maxLength={120} placeholder="e.g. Bank reconciliation" required /></label><label>Minutes studied<input type="number" min={1} max={1440} value={minutes} onChange={event => setMinutes(Number(event.target.value))} required /></label><button className="primary" disabled={busy}>Save session</button>{error && <p className="error-text">{error}</p>}</form></section><section className="card"><div className="section-title"><div><p className="eyebrow">LAST 7 DAYS</p><h3>Your study rhythm</h3></div></div><div className="week-chart">{week.map((day, i) => <div key={i}><div className="chart-track"><i style={{ height: `${Math.max(day.minutes ? 8 : 0, Math.min(100, day.minutes / goal * 100))}%` }} /></div><strong>{day.label}</strong><small>{day.minutes}m</small></div>)}</div><div className="section-title split"><div><p className="eyebrow">NEXT STEP</p><h3>Put it to the test</h3></div><button className="text-button" onClick={goToTests}>Open tests →</button></div></section></div><section className="card journal"><div className="section-title"><div><p className="eyebrow">YOUR HISTORY</p><h3>Recent sessions</h3></div></div>{logs.length ? logs.slice(0, 6).map(item => <div className="journal-row" key={item.id}><span className="subject-badge">{item.subject.slice(0, 2).toUpperCase()}</span><div><strong>{item.topic}</strong><small>{item.subject} · {new Date(`${item.study_date}T12:00:00`).toLocaleDateString("en-IN")}</small></div><b>{item.minutes} min</b></div>) : <p className="empty">Your study sessions will appear here once you log one.</p>}</section></>;
}
