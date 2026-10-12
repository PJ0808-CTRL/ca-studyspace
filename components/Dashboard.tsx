"use client";

import { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subjects, type Profile, type StudyLog } from "@/lib/types";
import type { Subject } from "@/lib/subjects";

const today = () => new Date().toLocaleDateString("en-CA");

export default function Dashboard({ supabase, userId, profile, logs, refresh }: { supabase: SupabaseClient; userId: string; profile: Profile; logs: StudyLog[]; refresh: () => Promise<void> }) {
  const [subject, setSubject] = useState<Subject>("Accounting");
  const [topic, setTopic] = useState("");
  const [minutes, setMinutes] = useState(60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingExamDate, setEditingExamDate] = useState(false);
  const [customExamDate, setCustomExamDate] = useState(profile.exam_date || "");

  const todayMinutes = logs.filter(item => item.study_date === today()).reduce((sum, item) => sum + item.minutes, 0);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    const iso = date.toLocaleDateString("en-CA");
    return {
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      minutes: logs.filter(item => item.study_date === iso).reduce((sum, item) => sum + item.minutes, 0),
    };
  });

  const streakDays = new Set(logs.map(item => item.study_date));
  const pointer = new Date();
  if (!streakDays.has(today())) pointer.setDate(pointer.getDate() - 1);
  let streak = 0;
  while (streakDays.has(pointer.toLocaleDateString("en-CA"))) {
    streak++;
    pointer.setDate(pointer.getDate() - 1);
  }
  const goal = profile.goal_minutes || 120;

  // Exam Countdown calculation
  const examInfo = useMemo(() => {
    if (!profile.exam_date) return null;
    const target = new Date(`${profile.exam_date}T00:00:00`);
    const diff = target.getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    let phase = "Foundation Stage";
    let phaseDesc = "Comprehensive syllabus learning and illustration mastery.";
    if (days < 30) {
      phase = "Final Sprint";
      phaseDesc = "Solve full 3-hour MTPs, revise RTP questions, and drill weak chapters.";
    } else if (days < 75) {
      phase = "Consolidation & Revision";
      phaseDesc = "First & second cycle revisions, chapter tests, and formula recall.";
    }
    return {
      days,
      formattedDate: target.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      phase,
      phaseDesc,
    };
  }, [profile.exam_date]);

  // Subject Balance Analytics
  const subjectDistribution = useMemo(() => {
    const totalMinutes = logs.reduce((sum, l) => sum + l.minutes, 0);
    const dist = subjects.map(subj => {
      const subjMinutes = logs.filter(l => l.subject === subj).reduce((sum, l) => sum + l.minutes, 0);
      const percentage = totalMinutes > 0 ? Math.round((subjMinutes / totalMinutes) * 100) : 25;
      return {
        subject: subj,
        minutes: subjMinutes,
        hours: Math.round((subjMinutes / 60) * 10) / 10,
        percentage,
      };
    });

    const lowest = totalMinutes > 0
      ? dist.reduce((min, curr) => (curr.percentage < min.percentage ? curr : min), dist[0])
      : null;

    return { dist, totalMinutes, lowest };
  }, [logs]);

  async function saveExamDate(dateStr: string) {
    setBusy(true);
    const { error: updateError } = await supabase.from("profiles").update({ exam_date: dateStr || null }).eq("id", profile.id);
    if (!updateError) {
      setEditingExamDate(false);
      await refresh();
    }
    setBusy(false);
  }

  async function saveLog(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const { error: saveError } = await supabase.from("study_logs").insert({
      user_id: userId,
      subject,
      topic: topic.trim(),
      minutes,
      study_date: today(),
    });
    if (saveError) setError(saveError.message);
    else {
      setTopic("");
      await refresh();
    }
    setBusy(false);
  }

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">YOUR STUDY DESK · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1>Good to see you, {profile.display_name.split(" ")[0]}.</h1>
        <p>Kal par mat chhod, ladle</p>
      </header>

      {/* Exam Countdown & Target Attempt Milestone Banner */}
      <section className="card exam-ticker-card">
        {examInfo ? (
          <div className="exam-ticker-content">
            <div className="ticker-badge">
              <span className="ticker-days">{Math.max(0, examInfo.days)}</span>
              <small>DAYS TO EXAM</small>
            </div>
            <div className="ticker-info">
              <div className="ticker-phase-row">
                <span className="tag">{examInfo.phase}</span>
                <span className="ticker-date">Target: {examInfo.formattedDate}</span>
                <button type="button" className="text-button" onClick={() => setEditingExamDate(true)}>Change ✎</button>
              </div>
              <strong className="ticker-heading">
                {examInfo.days > 0 ? `${examInfo.days} days remaining until CA Foundation.` : "Exam day is here! Give it your best shot."}
              </strong>
              <p className="subtle">{examInfo.phaseDesc}</p>
            </div>
          </div>
        ) : (
          <div className="exam-ticker-empty">
            <div>
              <p className="eyebrow">EXAM COUNTDOWN</p>
              <h3>Target your CA Foundation attempt</h3>
              <p className="subtle">Set your target exam date to unlock your live countdown and milestone revision roadmap.</p>
            </div>
            <div className="preset-date-buttons">
              <button type="button" className="preset-btn" onClick={() => void saveExamDate("2026-06-20")} disabled={busy}>
                June 2026
              </button>
              <button type="button" className="preset-btn" onClick={() => void saveExamDate("2026-09-18")} disabled={busy}>
                September 2026
              </button>
              <button type="button" className="preset-btn" onClick={() => void saveExamDate("2027-01-15")} disabled={busy}>
                January 2027
              </button>
              <button type="button" className="preset-btn outline" onClick={() => setEditingExamDate(true)}>
                Custom date…
              </button>
            </div>
          </div>
        )}

        {editingExamDate && (
          <form
            className="exam-date-form"
            onSubmit={e => {
              e.preventDefault();
              void saveExamDate(customExamDate);
            }}
          >
            <label>
              Choose exam date:
              <input
                type="date"
                value={customExamDate}
                onChange={e => setCustomExamDate(e.target.value)}
                required
              />
            </label>
            <div className="form-buttons">
              <button type="submit" className="primary" disabled={busy}>Set target</button>
              <button type="button" className="text-button" onClick={() => setEditingExamDate(false)}>Cancel</button>
            </div>
          </form>
        )}
      </section>

      {/* Today's Goal Hero */}
      <section className="goal-hero">
        <div>
          <span>TODAY&apos;S TARGET</span>
          <h2>{todayMinutes} <small>/ {goal} minutes</small></h2>
          <p>{todayMinutes >= goal ? "Daily goal complete. Well done." : `${goal - todayMinutes} minutes to go. Log your next study session below.`}</p>
          <div className="goal-bar">
            <i style={{ width: `${Math.min(100, (todayMinutes / goal) * 100)}%` }} />
          </div>
        </div>
        <div className="hero-number">
          {Math.min(100, Math.round((todayMinutes / goal) * 100))}%<small>completed</small>
        </div>
      </section>

      {/* Main Stats Grid */}
      <div className="stat-grid">
        <div className="stat">
          <span>STUDY STREAK</span>
          <strong>{streak} days</strong>
          <small>Keep showing up</small>
        </div>
        <div className="stat">
          <span>THIS WEEK</span>
          <strong>{Math.round((week.reduce((sum, day) => sum + day.minutes, 0) / 60) * 10) / 10} hours</strong>
          <small>Across all subjects</small>
        </div>
        <div className="stat">
          <span>STUDY SESSIONS</span>
          <strong>{logs.length}</strong>
          <small>Sessions logged</small>
        </div>
      </div>

      {/* Study Rhythm and Logging Grid */}
      <div className="dashboard-grid">
        <section className="card">
          <div className="section-title">
            <div>
              <p className="eyebrow">BUILD THE HABIT</p>
              <h3>Log study time</h3>
            </div>
          </div>
          <form className="form-stack" onSubmit={saveLog}>
            <label>
              Subject
              <select value={subject} onChange={event => setSubject(event.target.value as Subject)}>
                {subjects.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Topic
              <input value={topic} onChange={event => setTopic(event.target.value)} maxLength={120} placeholder="e.g. Bank reconciliation" required />
            </label>
            <label>
              Minutes studied
              <input type="number" min={1} max={1440} value={minutes} onChange={event => setMinutes(Number(event.target.value))} required />
            </label>
            <button className="primary" disabled={busy}>Save session</button>
            {error && <p className="error-text">{error}</p>}
          </form>
        </section>

        <section className="card">
          <div className="section-title">
            <div>
              <p className="eyebrow">LAST 7 DAYS</p>
              <h3>Your study rhythm</h3>
            </div>
          </div>
          <div className="week-chart">
            {week.map((day, i) => (
              <div key={i}>
                <div className="chart-track">
                  <i style={{ height: `${Math.max(day.minutes ? 8 : 0, Math.min(100, (day.minutes / goal) * 100))}%` }} />
                </div>
                <strong>{day.label}</strong>
                <small>{day.minutes}m</small>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Subject Distribution & Balance Analytics */}
      <section className="card subject-balance-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">PAPER BALANCE · 40% CUTOFF SECURITY</p>
            <h3>Subject study distribution</h3>
          </div>
          <span className="total-hours-tag">
            Total {Math.round((subjectDistribution.totalMinutes / 60) * 10) / 10} hrs logged
          </span>
        </div>
        <div className="subject-bars-list">
          {subjectDistribution.dist.map(item => (
            <div className="subject-bar-row" key={item.subject}>
              <div className="subject-bar-header">
                <strong>{item.subject}</strong>
                <span>{item.hours}h ({item.percentage}%)</span>
              </div>
              <div className="subject-bar-track">
                <i style={{ width: `${Math.max(item.minutes > 0 ? 4 : 0, item.percentage)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent History Journal */}
      <section className="card journal">
        <div className="section-title">
          <div>
            <p className="eyebrow">YOUR HISTORY</p>
            <h3>Recent sessions</h3>
          </div>
        </div>
        {logs.length ? (
          logs.slice(0, 6).map(item => (
            <div className="journal-row" key={item.id}>
              <span className="subject-badge">{item.subject.slice(0, 2).toUpperCase()}</span>
              <div>
                <strong>{item.topic}</strong>
                <small>{item.subject} · {new Date(`${item.study_date}T12:00:00`).toLocaleDateString("en-IN")}</small>
              </div>
              <b>{item.minutes} min</b>
            </div>
          ))
        ) : (
          <p className="empty">Your study sessions will appear here once you log one.</p>
        )}
      </section>
    </>
  );
}
