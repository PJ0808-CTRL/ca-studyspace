"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import ThemeToggle from "@/components/ThemeToggle";

export default function Auth({ supabase, initialMode = "signup" }: { supabase: SupabaseClient; initialMode?: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name.trim() }, emailRedirectTo: window.location.origin },
        });
        if (error) {
          const lower = error.message.toLowerCase();
          if (lower.includes("already registered") || lower.includes("already exists")) {
            setMessage("⚠️ An account with this email already exists! Please switch to 'Log in' to access your desk.");
            return;
          }
          throw error;
        }
        setMessage(
          data.session
            ? "Account created! Opening your dashboard…"
            : "Account created! You can now log in to your study space."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          const lower = error.message.toLowerCase();
          if (
            lower.includes("invalid login credentials") ||
            lower.includes("invalid_credentials") ||
            lower.includes("user not found")
          ) {
            setMessage("⚠️ No account found with this email, or incorrect password. If you are new here, you must create an account first! Switch to 'Create account' to register.");
            return;
          }
          if (lower.includes("email not confirmed")) {
            setMessage("⚠️ Your email has not been confirmed yet. Please check your inbox or ask the admin to confirm your account.");
            return;
          }
          throw error;
        }
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

  return (
    <div className="auth-page">
      <div className="auth-story">
        <span className="wordmark">CA <span>Orbit</span></span>
        <p className="eyebrow">FOR CA FOUNDATION ASPIRANTS</p>
        <h1>Your preparation has a place now.</h1>
        <p>Track the hours. Share useful notes. Find official papers. Solve doubts with students studying the same subjects.</p>
        <div className="auth-features">
          <span>01 <strong>Study with a plan</strong></span>
          <span>02 <strong>Share your notes</strong></span>
          <span>03 <strong>Learn together</strong></span>
        </div>
      </div>
      <div className="auth-side">
        <div className="auth-card">
          <div className="auth-theme"><ThemeToggle /></div>
          <p className="eyebrow">WELCOME TO CA ORBIT</p>
          <h2>{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
          <p className="subtle">{mode === "signup" ? "Your study space starts here." : "Pick up where you left off."}</p>
          <button className="google-button" type="button" onClick={() => void signInWithGoogle()} disabled={busy}>
            <span className="google-mark" aria-hidden="true">G</span>Continue with Google
          </button>
          <div className="auth-divider"><span>or continue with email</span></div>
          <div className="auth-tabs">
            <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>Create account</button>
            <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Log in</button>
          </div>
          <form onSubmit={submit}>
            {mode === "signup" && (
              <label>
                Display name
                <input value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={50} placeholder="Your name" required />
              </label>
            )}
            <label>
              Email address
              <input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={event => setPassword(event.target.value)} minLength={6} placeholder="At least 6 characters" required />
            </label>
            <button className="primary" disabled={busy}>
              {busy ? "Please wait…" : mode === "signup" ? "Create account →" : "Log in →"}
            </button>
          </form>
          {message && (
            <div className="notice" role="status">
              <div>{message}</div>
              {mode === "login" && message.includes("Create account") && (
                <button
                  type="button"
                  style={{
                    marginTop: "10px",
                    background: "#185838",
                    color: "#ffffff",
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                  onClick={() => {
                    setMode("signup");
                    setMessage("");
                  }}
                >
                  Switch to Create Account &rarr;
                </button>
              )}
              {mode === "signup" && message.includes("Log in") && (
                <button
                  type="button"
                  style={{
                    marginTop: "10px",
                    background: "#185838",
                    color: "#ffffff",
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                >
                  Switch to Log In &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
