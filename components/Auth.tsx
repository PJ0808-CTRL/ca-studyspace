"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import ThemeToggle from "@/components/ThemeToggle";

export default function Auth({ supabase }: { supabase: SupabaseClient }) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { display_name: name.trim() }, emailRedirectTo: window.location.origin } });
        if (error) throw error;
        setMessage(data.session ? "Account created. Opening your dashboard…" : "Check your email to confirm your account, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }

  async function signInWithGoogle() {
    setBusy(true); setMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
      if (error) throw error;
    } catch (error) { setMessage((error as Error).message); setBusy(false); }
  }

  return <div className="auth-page"><div className="auth-story"><span className="wordmark">CA <span>Studyspace</span><i>.</i></span><p className="eyebrow">FOR CA FOUNDATION ASPIRANTS</p><h1>Your preparation has a place now.</h1><p>Track the hours. Share useful notes. Find official papers. Solve doubts with students studying the same subjects.</p><div className="auth-features"><span>01 <strong>Study with a plan</strong></span><span>02 <strong>Share your notes</strong></span><span>03 <strong>Learn together</strong></span></div></div><div className="auth-side"><div className="auth-card"><div className="auth-theme"><ThemeToggle /></div><p className="eyebrow">WELCOME TO CA STUDYSPACE</p><h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2><p className="subtle">{mode === "signup" ? "Your study space starts here." : "Pick up where you left off."}</p><button className="google-button" type="button" onClick={() => void signInWithGoogle()} disabled={busy}><span className="google-mark" aria-hidden="true">G</span>Continue with Google</button><div className="auth-divider"><span>or continue with email</span></div><div className="auth-tabs"><button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>Create account</button><button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Log in</button></div><form onSubmit={submit}>{mode === "signup" && <label>Display name<input value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={50} placeholder="Your name" required /></label>}<label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /></label><label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={6} placeholder="At least 6 characters" required /></label><button className="primary" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? "Create account →" : "Log in →"}</button></form>{message && <div className="notice" role="status">{message}</div>}<small>Powered by Supabase Auth. Email confirmation may be required by your project settings.</small></div></div></div>;
}
