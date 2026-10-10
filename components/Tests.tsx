"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Subject } from "@/lib/questions";
import type { Attempt, QuizQuestion } from "@/lib/types";

type Review = { id: string; selected: number | null; correct: number; explanation: string };

export default function Tests({ supabase, attempts, refresh }: { supabase: SupabaseClient; attempts: Attempt[]; refresh: () => Promise<void> }) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [review, setReview] = useState<Review[] | null>(null);
  const [score, setScore] = useState(0);
  const [endsAt, setEndsAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = useCallback(async () => {
    if (!subject || busy || review) return;
    setBusy(true); setError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Session expired. Please log in again.");
      const response = await fetch("/api/test", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ subject, ids: questions.map(item => item.id), answers }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not submit test.");
      setReview(result.review); setScore(result.score); await refresh();
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }, [subject, busy, review, supabase, questions, answers, refresh]);

  useEffect(() => { if (!subject || review) return; const tick = () => setRemaining(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))); tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer); }, [subject, review, endsAt]);
  useEffect(() => { if (subject && questions.length && remaining === 0 && !busy && !review) void submit(); }, [subject, questions.length, remaining, busy, review, submit]);

  async function start(paper: Subject, mode: "sprint" | "mock") {
    setBusy(true); setError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("Session expired. Please log in again.");
      const response = await fetch(`/api/test?subject=${encodeURIComponent(paper)}&mode=${mode}`, { headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not start test.");
      setQuestions(result.questions); setAnswers({}); setReview(null); setSubject(paper); setEndsAt(Date.now() + result.minutes * 60_000); setRemaining(result.minutes * 60);
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }

  return <><header className="page-head"><p className="eyebrow">EXAM STUDIO</p><h1>Practice under pressure.</h1><p>Timed original question sets, instant scoring, and explanations you can learn from.</p></header>{error && <div className="notice error-text">{error}</div>}{subject ? <><div className="test-header"><div><p className="eyebrow">{subject.toUpperCase()}</p><h2>{review ? "Your result" : "Test in progress"}</h2><p>{questions.length} questions · {Object.keys(answers).length} answered</p></div><div className="clock">{review ? `${score}/${questions.length}` : `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`}</div></div>{review && <div className="notice success">Saved to your account. Review the answers below.</div>}<div className="question-list">{questions.map((question, index) => { const result = review?.find(item => item.id === question.id); return <section className="card question" key={question.id}><div className="question-top"><span>QUESTION {index + 1} OF {questions.length}</span><span>{question.topic}</span></div><h3>{question.prompt}</h3><div className="choices">{question.options.map((choice, i) => <button key={i} disabled={!!review || remaining === 0} className={`${answers[question.id] === i ? "chosen" : ""} ${result?.correct === i ? "correct" : ""} ${result?.selected === i && result.correct !== i ? "wrong" : ""}`} onClick={() => setAnswers(current => ({ ...current, [question.id]: i }))}><b>{String.fromCharCode(65 + i)}</b>{choice}</button>)}</div>{result && <div className="explanation"><strong>Explanation</strong> {result.explanation}</div>}</section>; })}</div><div className="test-actions">{review ? <button className="primary" onClick={() => { setSubject(null); setQuestions([]); setReview(null); }}>Back to tests</button> : <button className="primary" disabled={busy} onClick={() => void submit()}>Submit test →</button>}</div></> : <><div className="test-options">{(["Quantitative Aptitude", "Business Economics"] as Subject[]).flatMap((paper, index) => (["sprint", "mock"] as const).map(mode => <button key={`${paper}-${mode}`} className="test-option" disabled={busy} onClick={() => void start(paper, mode)}><div className="test-icon">{index === 0 ? "∑" : "↗"}</div><span>PAPER {index + 3} · {mode === "mock" ? "20 Q · 30 MIN" : "10 Q · 15 MIN"}</span><strong>{paper}</strong><p>{mode === "mock" ? "Longer practice across the question bank." : "A different quick set on each attempt."}</p><em>Start {mode} →</em></button>))}</div><section className="card history"><div className="section-title"><div><p className="eyebrow">YOUR RECORD</p><h3>Previous attempts</h3></div></div>{attempts.length ? attempts.slice(0, 10).map(item => <div className="history-row" key={item.id}><span><strong>{item.subject}</strong><small>{new Date(item.created_at).toLocaleString("en-IN")}</small></span><b>{item.score}/{item.total}</b></div>) : <p className="empty">Your results appear here after the first test.</p>}</section></>}</>;
}
