"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import ThemeToggle from "@/components/ThemeToggle";
import { verifyModeratorPasscode, activateModeratorSession } from "@/lib/moderation";

export default function ModeratorAuth({
  supabase,
  onBack,
  onAuthenticated,
}: {
  supabase: SupabaseClient;
  onBack: () => void;
  onAuthenticated: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [passcode, setPasscode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");

    // 1. Verify moderator passcode
    if (!verifyModeratorPasscode(passcode)) {
      setError("Access denied: Invalid moderator security password. Only authorized personnel can sign in here.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const displayName = name.trim() || "CA Moderator";
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          activateModeratorSession(data.user.id);
        }
        if (data.session) {
          onAuthenticated();
        } else {
          setNotice("Moderator account registered. Check your email to confirm, then log in.");
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        if (data.user) {
          activateModeratorSession(data.user.id);
        }
        onAuthenticated();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page mod-auth-page">
      <div className="auth-story mod-auth-story">
        <span className="wordmark">
          CA <span>Studyspace</span>
        </span>
        <div className="mod-portal-badge">
          <span>🛡️</span>
          <span>ADMINISTRATOR & MODERATOR PORTAL</span>
        </div>
        <h1>Study Space Moderation Hub.</h1>
        <p>
          Restricted access for CA Studyspace verified community moderators. Supervise live rooms, enforce academic guidelines, purge disruptive spam, and maintain a focused study atmosphere.
        </p>
        <div className="auth-features">
          <span>01 <strong>Purge disruptive spam</strong></span>
          <span>02 <strong>Resolve reported messages</strong></span>
          <span>03 <strong>Protect aspirant community</strong></span>
        </div>
      </div>

      <div className="auth-side mod-auth-side">
        <div className="auth-card mod-auth-card">
          <div className="mod-auth-header-top">
            <button type="button" className="auth-back-link" onClick={onBack}>
              ← Back to homepage
            </button>
            <ThemeToggle />
          </div>

          <div className="mod-key-badge">
            <span className="mod-key-icon">🛡️</span>
            <div>
              <p className="eyebrow" style={{ margin: 0, color: "#1e6d4f" }}>
                SECURE ACCESS
              </p>
              <h2 style={{ fontSize: 28, margin: "2px 0 0" }}>Moderator Sign In</h2>
            </div>
          </div>
          <p className="subtle" style={{ margin: "6px 0 20px" }}>
            Enter the moderator master security password along with your account credentials.
          </p>

          <div className="auth-tabs">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
                setNotice("");
              }}
            >
              Moderator Log In
            </button>
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => {
                setMode("signup");
                setError("");
                setNotice("");
              }}
            >
              New Moderator Setup
            </button>
          </div>

          <form onSubmit={submit} className="form-stack">
            <label className="mod-passcode-field">
              <span className="mod-field-title">
                <span>🔑</span> Moderator Security Password
              </span>
              <input
                type="password"
                value={passcode}
                onChange={event => setPasscode(event.target.value)}
                placeholder="Enter secret moderator password"
                required
                autoComplete="current-password"
                className="mod-secret-input"
              />
              <small className="fine">Required security key known only to authorized moderators.</small>
            </label>

            {mode === "signup" && (
              <label>
                Moderator Display Name
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  minLength={2}
                  maxLength={50}
                  placeholder="e.g. Moderator Priya or Staff Admin"
                  required
                />
              </label>
            )}

            <label>
              Account Email
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="moderator@example.com"
                required
                autoComplete="email"
              />
            </label>

            <label>
              Account Password
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                minLength={6}
                placeholder="At least 6 characters"
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>

            <button className="primary mod-submit-btn" disabled={busy}>
              {busy ? "Verifying access…" : mode === "signup" ? "Register Moderator Account →" : "Sign In to Moderation Hub →"}
            </button>
          </form>

          {error && (
            <div className="notice error-text mod-notice-box" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="notice success mod-notice-box" role="status">
              {notice}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
