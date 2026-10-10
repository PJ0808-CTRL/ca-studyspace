"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subjects } from "@/lib/types";
import type { Subject } from "@/lib/subjects";

type Mode = "focus" | "break";
type Status = "idle" | "running" | "paused" | "saving";

type StoredTimer = {
  mode: Mode;
  status: Exclude<Status, "saving">;
  remaining: number;
  endsAt: number | null;
  focusMinutes: number;
  subject: Subject;
  topic: string;
  logId: string | null;
  completedDate: string;
  completedCount: number;
};

const focusOptions = [25, 45, 50];
const breakMinutes = 5;
const today = () => new Date().toLocaleDateString("en-CA");

export default function Pomodoro({ supabase, userId, refresh }: { supabase: SupabaseClient; userId: string; refresh: () => Promise<void> }) {
  const storageKey = `ca-campus-pomodoro-${userId}`;
  const [mode, setMode] = useState<Mode>("focus");
  const [status, setStatus] = useState<Status>("idle");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [subject, setSubject] = useState<Subject>("Accounting");
  const [topic, setTopic] = useState("");
  const [logId, setLogId] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const finishing = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as StoredTimer;
        const count = saved.completedDate === today() ? saved.completedCount : 0;
        setMode(saved.mode);
        setStatus(saved.status);
        setFocusMinutes(saved.focusMinutes);
        setRemaining(saved.status === "running" && saved.endsAt ? Math.max(0, Math.ceil((saved.endsAt - Date.now()) / 1000)) : saved.remaining);
        setEndsAt(saved.endsAt);
        setSubject(saved.subject);
        setTopic(saved.topic);
        setLogId(saved.logId);
        setCompletedCount(count);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const saved: StoredTimer = { mode, status: status === "saving" ? "paused" : status, remaining, endsAt, focusMinutes, subject, topic, logId, completedDate: today(), completedCount };
    localStorage.setItem(storageKey, JSON.stringify(saved));
  }, [hydrated, storageKey, mode, status, remaining, endsAt, focusMinutes, subject, topic, logId, completedCount]);

  const completeSession = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    setEndsAt(null);

    if (mode === "break") {
      setMode("focus");
      setRemaining(focusMinutes * 60);
      setStatus("idle");
      setMessage("Break complete. You are ready for another focus session.");
      finishing.current = false;
      return;
    }

    setStatus("saving");
    setError("");
    const sessionLogId = logId || crypto.randomUUID();
    setLogId(sessionLogId);
    const { error: saveError } = await supabase.from("study_logs").insert({
      id: sessionLogId,
      user_id: userId,
      subject,
      topic: topic.trim() || "Pomodoro focus session",
      minutes: focusMinutes,
      study_date: today(),
    });

    if (saveError && saveError.code !== "23505") {
      setStatus("paused");
      setError(`Your timer finished, but the session could not be saved: ${saveError.message}`);
      finishing.current = false;
      return;
    }

    setCompletedCount(count => count + 1);
    setMode("break");
    setRemaining(breakMinutes * 60);
    setStatus("idle");
    setLogId(null);
    setMessage(`${focusMinutes} focused minutes saved to your dashboard. Take a short break.`);
    await refresh();
    finishing.current = false;
  }, [focusMinutes, logId, mode, refresh, subject, supabase, topic, userId]);

  useEffect(() => {
    if (!hydrated || status !== "running" || !endsAt) return;
    const update = () => {
      const next = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) void completeSession();
    };
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [completeSession, endsAt, hydrated, status]);

  useEffect(() => {
    if (status === "running") document.title = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")} · CA Studyspace`;
    else document.title = "CA Studyspace — Study better together";
    return () => { document.title = "CA Studyspace — Study better together"; };
  }, [remaining, status]);

  function startOrPause() {
    setMessage(""); setError("");
    if (status === "running") {
      setStatus("paused");
      setEndsAt(null);
      return;
    }
    if (mode === "focus" && !topic.trim()) {
      setError("Add the topic you are studying before starting.");
      return;
    }
    if (remaining <= 0) setRemaining((mode === "focus" ? focusMinutes : breakMinutes) * 60);
    const seconds = remaining <= 0 ? (mode === "focus" ? focusMinutes : breakMinutes) * 60 : remaining;
    if (mode === "focus" && !logId) setLogId(crypto.randomUUID());
    setEndsAt(Date.now() + seconds * 1000);
    setStatus("running");
  }

  function reset() {
    setStatus("idle");
    setEndsAt(null);
    setRemaining((mode === "focus" ? focusMinutes : breakMinutes) * 60);
    setLogId(null);
    setMessage(""); setError("");
  }

  function chooseFocusMinutes(minutes: number) {
    if (status === "running" || status === "saving") return;
    setFocusMinutes(minutes);
    if (mode === "focus") setRemaining(minutes * 60);
    setLogId(null);
  }

  function chooseMode(nextMode: Mode) {
    if (status === "running" || status === "saving") return;
    setMode(nextMode);
    setStatus("idle");
    setRemaining((nextMode === "focus" ? focusMinutes : breakMinutes) * 60);
    setEndsAt(null); setLogId(null); setMessage(""); setError("");
  }

  const totalSeconds = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
  const progress = Math.max(0, Math.min(100, ((totalSeconds - remaining) / totalSeconds) * 100));
  const time = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  return <><header className="page-head"><p className="eyebrow">FOCUS STUDIO</p><h1>One session. One clear goal.</h1><p>Choose a topic, start the clock, and your completed focus time will be added to the dashboard automatically.</p></header><div className="pomodoro-layout"><section className={`pomodoro-stage ${mode}`}><div className="pomodoro-tabs"><button className={mode === "focus" ? "active" : ""} onClick={() => chooseMode("focus")}>Focus</button><button className={mode === "break" ? "active" : ""} onClick={() => chooseMode("break")}>Short break</button></div><div className="timer-orbit" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><div className="timer-face"><span>{mode === "focus" ? "FOCUS TIME" : "BREATHE"}</span><strong>{time}</strong><small>{status === "running" ? "Stay with it" : status === "paused" ? "Paused" : status === "saving" ? "Saving session…" : "Ready when you are"}</small></div></div><div className="timer-actions"><button className="timer-secondary" onClick={reset} disabled={status === "saving"} aria-label="Reset timer">↺</button><button className="timer-primary" onClick={startOrPause} disabled={status === "saving"}>{status === "running" ? "Pause" : status === "paused" ? "Continue" : mode === "focus" ? "Start focus" : "Start break"}</button></div><div className="cycle-row"><span>{completedCount} session{completedCount === 1 ? "" : "s"} today</span><div>{[0, 1, 2, 3].map(index => <i className={index < completedCount % 4 || (completedCount > 0 && completedCount % 4 === 0) ? "done" : ""} key={index} />)}</div></div></section><aside className="card pomodoro-plan"><div><p className="eyebrow">SESSION PLAN</p><h3>What are you focusing on?</h3></div><div className="form-stack"><label>Subject<select value={subject} onChange={event => setSubject(event.target.value as Subject)} disabled={status === "running" || status === "saving"}>{subjects.map(item => <option key={item}>{item}</option>)}</select></label><label>Topic<input value={topic} onChange={event => setTopic(event.target.value)} maxLength={120} placeholder="e.g. Bank reconciliation" disabled={status === "running" || status === "saving"} /></label><label>Focus length<div className="duration-options">{focusOptions.map(minutes => <button className={focusMinutes === minutes ? "active" : ""} onClick={() => chooseFocusMinutes(minutes)} disabled={status === "running" || status === "saving"} key={minutes}>{minutes}<small>min</small></button>)}</div></label></div><div className="pomodoro-note"><span>✦</span><p><strong>Automatic progress</strong>Finishing a focus session logs its full length under the selected subject. Breaks are never counted as study time.</p></div>{message && <div className="notice success">{message}</div>}{error && <div className="notice error-text">{error}</div>}</aside></div></>;
}
