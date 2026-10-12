"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subjects, type StudyTask } from "@/lib/types";
import type { Subject } from "@/lib/subjects";
import {
  initAudio,
  playCompletionChime,
  startAmbientSound,
  stopAmbientSound,
  type AmbientSoundType,
} from "@/lib/sound";

type Mode = "focus" | "break";
type Status = "idle" | "running" | "paused" | "saving";

type StoredTimer = {
  mode: Mode;
  status: Exclude<Status, "saving">;
  remaining: number;
  endsAt: number | null;
  focusMinutes: number;
  breakMinutes?: number;
  subject: Subject;
  topic: string;
  logId: string | null;
  taskId?: string | null;
  completedDate: string;
  completedCount: number;
};

const focusPresets = [15, 25, 45, 60];
const breakPresets = [5, 10, 15, 20];
const today = () => new Date().toLocaleDateString("en-CA");

const MOTIVATIONAL_QUOTES = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The difference between an ordinary student and a Chartered Accountant is discipline.", author: "CA Community" },
  { text: "Balance sheets may not tally on the first attempt, but persistence always balances out.", author: "Foundation Mentor" },
  { text: "Every concept and provision you master today brings you closer to the prefix 'CA'.", author: "Study Space" },
  { text: "Do what is right, not what is easy. Master one concept at a time.", author: "Anonymous" },
  { text: "You don't have to be extreme, just consistent. Deep focus compounds exponentially.", author: "Anonymous" },
  { text: "The expert in anything was once a beginner. Keep turning the pages.", author: "Helen Hayes" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Your future self is depending on what you do in this exact 25-minute block.", author: "Anonymous" },
  { text: "Clear your mind of doubt. Every adjustment and theory is learnable.", author: "Anonymous" },
  { text: "Tough questions don't last, persistent aspirants do.", author: "Anonymous" },
  { text: "Small disciplines repeated with consistency every day lead to great achievements.", author: "John C. Maxwell" },
  { text: "Believe in your preparation. The exam hall rewards honest, quiet dedication.", author: "Anonymous" },
  { text: "Fall in love with the process of learning, and results will follow naturally.", author: "Anonymous" },
  { text: "Focus is saying no to distractions so your dreams can say yes.", author: "Anonymous" },
  { text: "Energy flows where attention goes. Give this session your absolute best.", author: "Anonymous" },
];

export default function Pomodoro({
  supabase,
  userId,
  refresh,
}: {
  supabase: SupabaseClient;
  userId: string;
  refresh: () => Promise<void>;
}) {
  const storageKey = `ca-campus-pomodoro-${userId}`;
  const [mode, setMode] = useState<Mode>("focus");
  const [status, setStatus] = useState<Status>("idle");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [remaining, setRemaining] = useState(25 * 60);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [subject, setSubject] = useState<Subject>("Accounting");
  const [topic, setTopic] = useState("");
  const [logId, setLogId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [ambientSound, setAmbientSound] = useState<AmbientSoundType>("none");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const finishing = useRef(false);
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length));
  const [quoteVisible, setQuoteVisible] = useState(true);
  const lastQuoteInterval = useRef<number>(-1);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as StoredTimer;
        const count = saved.completedDate === today() ? saved.completedCount : 0;
        setMode(saved.mode);
        setStatus(saved.status);
        const fMin = saved.focusMinutes || 25;
        const bMin = saved.breakMinutes || 5;
        setFocusMinutes(fMin);
        setBreakMinutes(bMin);
        setRemaining(
          saved.status === "running" && saved.endsAt
            ? Math.max(0, Math.ceil((saved.endsAt - Date.now()) / 1000))
            : saved.remaining
        );
        setEndsAt(saved.endsAt);
        setSubject(saved.subject);
        setTopic(saved.topic);
        setLogId(saved.logId);
        setTaskId(saved.taskId || null);
        setCompletedCount(count);
      }
    } catch {
      localStorage.removeItem(storageKey);
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    const saved: StoredTimer = {
      mode,
      status: status === "saving" ? "paused" : status,
      remaining,
      endsAt,
      focusMinutes,
      breakMinutes,
      subject,
      topic,
      logId,
      taskId,
      completedDate: today(),
      completedCount,
    };
    localStorage.setItem(storageKey, JSON.stringify(saved));
  }, [
    hydrated,
    storageKey,
    mode,
    status,
    remaining,
    endsAt,
    focusMinutes,
    breakMinutes,
    subject,
    topic,
    logId,
    taskId,
    completedCount,
  ]);

  const loadTasks = useCallback(async () => {
    const { data } = await supabase
      .from("study_tasks")
      .select("*")
      .eq("completed", false)
      .order("due_date")
      .limit(30);
    setTasks((data || []) as StudyTask[]);
  }, [supabase]);

  useEffect(() => {
    void loadTasks();
    const update = () => void loadTasks();
    window.addEventListener("ca-study-tasks-updated", update);
    return () => window.removeEventListener("ca-study-tasks-updated", update);
  }, [loadTasks]);

  const completeSession = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    setEndsAt(null);
    stopAmbientSound();
    setAmbientSound("none");
    if (soundEnabled) playCompletionChime();

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

    const linkedTask = tasks.find(task => task.id === taskId);
    if (linkedTask) {
      const loggedMinutes = Math.min(1440, linkedTask.logged_minutes + focusMinutes);
      const completed = loggedMinutes >= linkedTask.planned_minutes;
      const { error: taskError } = await supabase
        .from("study_tasks")
        .update({
          logged_minutes: loggedMinutes,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq("id", linkedTask.id);
      if (taskError) {
        setError(`The session was saved, but its planned task could not be updated: ${taskError.message}`);
      }
    }

    setCompletedCount(count => count + 1);
    setMode("break");
    setRemaining(breakMinutes * 60);
    setStatus("idle");
    setLogId(null);
    setTaskId(null);
    setMessage(
      `${focusMinutes} focused minutes saved${
        linkedTask ? " and added to your planned task" : " to your dashboard"
      }. Take a short break.`
    );
    await refresh();
    await loadTasks();
    window.dispatchEvent(new Event("ca-study-tasks-updated"));
    finishing.current = false;
  }, [
    breakMinutes,
    focusMinutes,
    loadTasks,
    logId,
    mode,
    refresh,
    soundEnabled,
    subject,
    supabase,
    taskId,
    tasks,
    topic,
    userId,
  ]);

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
    if (status === "running") {
      document.title = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
        remaining % 60
      ).padStart(2, "0")} · CA Studyspace`;
    } else {
      document.title = "CA Studyspace — Study better together";
    }
    return () => {
      document.title = "CA Studyspace — Study better together";
    };
  }, [remaining, status]);

  // Rotate motivational quote with smooth fade-out and fade-in every 2 minutes (120s of elapsed focus time)
  useEffect(() => {
    if (mode !== "focus" || status !== "running") {
      lastQuoteInterval.current = -1;
      setQuoteVisible(true);
      return;
    }
    const elapsed = Math.max(0, focusMinutes * 60 - remaining);
    const currentInterval = Math.floor(elapsed / 120);

    if (lastQuoteInterval.current === -1) {
      lastQuoteInterval.current = currentInterval;
      setQuoteVisible(true);
    } else if (currentInterval !== lastQuoteInterval.current) {
      lastQuoteInterval.current = currentInterval;
      // 1. Fade out the current quote
      setQuoteVisible(false);
      // 2. Once faded out, swap the quote and fade back in
      const timer = window.setTimeout(() => {
        setQuoteIndex(prev => {
          let next = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
          if (next === prev && MOTIVATIONAL_QUOTES.length > 1) {
            next = (next + 1) % MOTIVATIONAL_QUOTES.length;
          }
          return next;
        });
        setQuoteVisible(true);
      }, 500);
      return () => window.clearTimeout(timer);
    }
  }, [mode, status, remaining, focusMinutes]);

  function startOrPause() {
    initAudio();
    setMessage("");
    setError("");

    if (status === "running") {
      setStatus("paused");
      setEndsAt(null);
      return;
    }

    if (mode === "focus" && !topic.trim()) {
      setError("Add the topic you are studying before starting.");
      return;
    }

    const currentSpan = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
    if (remaining <= 0) setRemaining(currentSpan);
    const seconds = remaining <= 0 ? currentSpan : remaining;

    if (mode === "focus" && !logId) setLogId(crypto.randomUUID());
    setEndsAt(Date.now() + seconds * 1000);
    setStatus("running");

    // If an ambient sound was selected, make sure it is playing
    if (ambientSound !== "none") {
      startAmbientSound(ambientSound);
    }
  }

  function reset() {
    setStatus("idle");
    setEndsAt(null);
    setRemaining((mode === "focus" ? focusMinutes : breakMinutes) * 60);
    setLogId(null);
    setMessage("");
    setError("");
  }

  function chooseTask(id: string) {
    setTaskId(id || null);
    const task = tasks.find(item => item.id === id);
    if (task) {
      setSubject(task.subject);
      setTopic(task.title);
    }
  }

  function chooseFocusMinutes(val: number) {
    const minutes = Math.max(1, Math.min(180, Math.round(val)));
    setFocusMinutes(minutes);
    if (status !== "running" && status !== "saving" && mode === "focus") {
      setRemaining(minutes * 60);
      setEndsAt(null);
      setLogId(null);
    }
  }

  function chooseBreakMinutes(val: number) {
    const minutes = Math.max(1, Math.min(60, Math.round(val)));
    setBreakMinutes(minutes);
    if (status !== "running" && status !== "saving" && mode === "break") {
      setRemaining(minutes * 60);
      setEndsAt(null);
    }
  }

  function chooseMode(nextMode: Mode) {
    if (status === "running" || status === "saving") return;
    setMode(nextMode);
    setStatus("idle");
    setRemaining((nextMode === "focus" ? focusMinutes : breakMinutes) * 60);
    setEndsAt(null);
    setLogId(null);
    setMessage("");
    setError("");
  }

  function handleAmbientClick(type: AmbientSoundType) {
    initAudio();
    if (type === ambientSound) {
      setAmbientSound("none");
      stopAmbientSound();
    } else {
      setAmbientSound(type);
      if (type === "none") {
        stopAmbientSound();
      } else {
        startAmbientSound(type);
      }
    }
  }

  const totalSeconds = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
  const progress = Math.max(0, Math.min(100, ((totalSeconds - remaining) / totalSeconds) * 100));
  const time = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(
    remaining % 60
  ).padStart(2, "0")}`;

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">FOCUS STUDIO</p>
        <h1>One session. One clear goal.</h1>
        <p>
          Choose a topic, customize your focus and break lengths, and your study time logs
          automatically.
        </p>
      </header>

      <div className="pomodoro-layout">
        {/* Timer Stage */}
        <section className={`pomodoro-stage ${mode}`}>
          <div className="pomodoro-tabs">
            <button
              className={mode === "focus" ? "active" : ""}
              onClick={() => chooseMode("focus")}
            >
              Focus ({focusMinutes}m)
            </button>
            <button
              className={mode === "break" ? "active" : ""}
              onClick={() => chooseMode("break")}
            >
              Short break ({breakMinutes}m)
            </button>
          </div>

          {/* 2-Minute Motivational Quote in Focus Mode (At the top, above the clock with fade in/out) */}
          {mode === "focus" && (status === "running" || status === "paused") && (
            <div
              className={`pomodoro-motivation-card ${quoteVisible ? "fade-in" : "fade-out"}`}
              role="status"
              aria-live="polite"
            >
              <p className="pomodoro-quote-text">
                “{MOTIVATIONAL_QUOTES[quoteIndex]?.text || MOTIVATIONAL_QUOTES[0].text}”
              </p>
              <span className="pomodoro-quote-author">
                — {MOTIVATIONAL_QUOTES[quoteIndex]?.author || MOTIVATIONAL_QUOTES[0].author}
              </span>
            </div>
          )}

          <div
            className="timer-orbit"
            style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}
          >
            <div className="timer-face">
              <span>{mode === "focus" ? "FOCUS TIME" : "BREATHE"}</span>
              <strong>{time}</strong>
              <small>
                {status === "running"
                  ? "Stay with it"
                  : status === "paused"
                  ? "Paused"
                  : status === "saving"
                  ? "Saving session…"
                  : "Ready when you are"}
              </small>
            </div>
          </div>

          <div className="timer-actions">
            <button
              className="timer-secondary"
              onClick={reset}
              disabled={status === "saving"}
              aria-label="Reset timer"
            >
              ↺
            </button>
            <button
              className="timer-primary"
              onClick={startOrPause}
              disabled={status === "saving"}
            >
              {status === "running"
                ? "Pause"
                : status === "paused"
                ? "Continue"
                : mode === "focus"
                ? `Start focus (${focusMinutes}m)`
                : `Start break (${breakMinutes}m)`}
            </button>
          </div>

          <div className="cycle-row">
            <span>
              {completedCount} session{completedCount === 1 ? "" : "s"} today
            </span>
            <div>
              {[0, 1, 2, 3].map(index => (
                <i
                  className={
                    index < completedCount % 4 ||
                    (completedCount > 0 && completedCount % 4 === 0)
                      ? "done"
                      : ""
                  }
                  key={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Session Plan & Settings Aside */}
        <aside className="card pomodoro-plan">
          <div>
            <p className="eyebrow">SESSION SETUP</p>
            <h3>What are you focusing on?</h3>
          </div>

          <div className="form-stack">
            {tasks.length > 0 && (
              <label>
                Planned task <span className="optional">optional</span>
                <select
                  value={taskId || ""}
                  onChange={event => chooseTask(event.target.value)}
                  disabled={status === "running" || status === "saving"}
                >
                  <option value="">No linked task</option>
                  {tasks.map(task => (
                    <option value={task.id} key={task.id}>
                      {task.title} · {task.logged_minutes}/{task.planned_minutes} min
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Subject
              <select
                value={subject}
                onChange={event => {
                  setSubject(event.target.value as Subject);
                  setTaskId(null);
                }}
                disabled={status === "running" || status === "saving"}
              >
                {subjects.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Topic
              <input
                value={topic}
                onChange={event => {
                  setTopic(event.target.value);
                  setTaskId(null);
                }}
                maxLength={120}
                placeholder="e.g. Bank reconciliation statement"
                disabled={status === "running" || status === "saving"}
              />
            </label>

            {/* Custom Focus Length */}
            <label>
              Focus length
              <div className="duration-picker-box">
                <div className="duration-options">
                  {focusPresets.map(minutes => (
                    <button
                      type="button"
                      className={focusMinutes === minutes ? "active" : ""}
                      onClick={() => chooseFocusMinutes(minutes)}
                      disabled={status === "running" || status === "saving"}
                      key={minutes}
                    >
                      {minutes}
                      <small>min</small>
                    </button>
                  ))}
                </div>
                <div className="custom-duration-input">
                  <span>Custom:</span>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      min={1}
                      max={180}
                      value={focusMinutes}
                      onChange={e => chooseFocusMinutes(Number(e.target.value) || 1)}
                      disabled={status === "running" || status === "saving"}
                      placeholder="Min"
                    />
                    <span>min</span>
                  </div>
                </div>
              </div>
            </label>

            {/* Custom Short Break Length */}
            <label>
              Short break length
              <div className="duration-picker-box">
                <div className="duration-options">
                  {breakPresets.map(minutes => (
                    <button
                      type="button"
                      className={breakMinutes === minutes ? "active" : ""}
                      onClick={() => chooseBreakMinutes(minutes)}
                      disabled={status === "running" || status === "saving"}
                      key={minutes}
                    >
                      {minutes}
                      <small>min</small>
                    </button>
                  ))}
                </div>
                <div className="custom-duration-input">
                  <span>Custom:</span>
                  <div className="input-with-unit">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={breakMinutes}
                      onChange={e => chooseBreakMinutes(Number(e.target.value) || 1)}
                      disabled={status === "running" || status === "saving"}
                      placeholder="Min"
                    />
                    <span>min</span>
                  </div>
                </div>
              </div>
            </label>
          </div>

          {/* Focus Atmosphere Panel */}
          <div className="pomodoro-sound-panel">
            <div className="sound-header">
              <span className="eyebrow" style={{ margin: 0 }}>
                FOCUS ATMOSPHERE
              </span>
              <label className="sound-chime-toggle">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={e => setSoundEnabled(e.target.checked)}
                />
                <span>Bell chime</span>
              </label>
            </div>

            <div className="ambient-selector">
              {(
                [
                  ["none", "🔇 Silence"],
                  ["rain", "🌧️ Rain"],
                  ["whitenoise", "🍃 White noise"],
                  ["binaural", "🧠 Alpha 432Hz"],
                ] as [AmbientSoundType, string][]
              ).map(([type, label]) => (
                <button
                  type="button"
                  key={type}
                  className={ambientSound === type ? "active" : ""}
                  onClick={() => handleAmbientClick(type)}
                >
                  {label}
                </button>
              ))}
            </div>

            {ambientSound !== "none" ? (
              <div className="ambient-status-row">
                <small className="ambient-hint">
                  ● Playing {ambientSound === "rain" ? "Rain" : ambientSound === "whitenoise" ? "White noise" : "Alpha 432Hz"} soundscape
                </small>
                <button
                  type="button"
                  className="ambient-mute-btn"
                  onClick={() => handleAmbientClick("none")}
                >
                  Mute
                </button>
              </div>
            ) : (
              <small className="ambient-hint idle">
                Tap any soundscape above to play authentic study atmosphere.
              </small>
            )}
          </div>

          {message && <div className="notice success">{message}</div>}
          {error && <div className="notice error-text">{error}</div>}
        </aside>
      </div>
    </>
  );
}
