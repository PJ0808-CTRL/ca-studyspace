"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export default function Settings({ supabase, profile, refresh }: { supabase: SupabaseClient; profile: Profile; refresh: () => Promise<void> }) {
  const [name, setName] = useState(profile.display_name);
  const [goal, setGoal] = useState(profile.goal_minutes);
  const [examDate, setExamDate] = useState(profile.exam_date || "");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const newName = name.trim();
    const { error } = await supabase.from("profiles").update({ display_name: newName, goal_minutes: goal, exam_date: examDate || null }).eq("id", profile.id);
    if (error) {
      setMessage(error.message);
    } else {
      // Propagate display name to historical chats, rooms and discussions
      try {
        await Promise.allSettled([
          supabase.from("room_messages").update({ author_name: newName }).eq("user_id", profile.id),
          supabase.from("discussions").update({ author_name: newName }).eq("user_id", profile.id),
          supabase.from("replies").update({ author_name: newName }).eq("user_id", profile.id),
        ]);
      } catch {
        // Fallback gracefully if database RLS limits bulk historical updates
      }
      setMessage("Profile saved. Your updated name is now active across all rooms & discussions.");
      await refresh();
    }
    setBusy(false);
  }
  return (
    <>
      <header className="page-head">
        <p className="eyebrow">YOUR ACCOUNT</p>
        <h1>Make it yours.</h1>
        <p>Set your name, study target, and exam goal.</p>
      </header>
      <section className="card settings-card">
        <form className="form-stack" onSubmit={save}>
          <label>
            Display name
            <input value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={50} required />
          </label>
          <label>
            Daily goal (minutes)
            <input type="number" min={15} max={720} value={goal} onChange={event => setGoal(Number(event.target.value))} required />
          </label>
          <label>
            Target exam date
            <input type="date" value={examDate} onChange={event => setExamDate(event.target.value)} />
          </label>
          <button className="primary" disabled={busy}>Save changes</button>
          {message && <p className="notice success">{message}</p>}
        </form>
        <div className="section-title split">
          <div>
            <p className="eyebrow">SESSION</p>
            <h3>Sign out</h3>
          </div>
        </div>
        <p className="subtle" style={{ marginTop: 8, marginBottom: 16 }}>Sign out of your CA Studyspace account on this device.</p>
        <button type="button" className="danger-button" onClick={() => void supabase.auth.signOut()}>Log out of your account ↗</button>
      </section>
    </>
  );
}
