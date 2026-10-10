"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Auth from "@/components/Auth";
import Dashboard from "@/components/Dashboard";
import Tests from "@/components/Tests";
import Rooms from "@/components/Rooms";
import Notes from "@/components/Notes";
import Community from "@/components/Community";
import Resources from "@/components/Resources";
import Settings from "@/components/Settings";
import ThemeToggle from "@/components/ThemeToggle";
import { getSupabase } from "@/lib/supabase";
import type { Attempt, Discussion, Profile, Reply, StudyLog } from "@/lib/types";

type View = "dashboard" | "tests" | "rooms" | "community" | "notes" | "resources" | "settings";
const navigation: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "tests", label: "Practice tests", icon: "◎" },
  { id: "rooms", label: "Live rooms", icon: "◉" },
  { id: "community", label: "Discussions", icon: "☷" },
  { id: "notes", label: "Notes", icon: "▤" },
  { id: "resources", label: "ICAI papers", icon: "↗" },
  { id: "settings", label: "My profile", icon: "⚙" },
];

export default function Home() {
  const supabase = useMemo(() => getSupabase(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("dashboard");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    supabase.auth.getUser().then(({ data }) => { if (alive) { setUser(data.user); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (alive) { setUser(session?.user ?? null); setLoading(false); } });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [supabase]);

  const refresh = useCallback(async () => {
    if (!supabase || !user) return;
    setLoadingData(true); setError("");
    try {
      let { data: found, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!found) {
        const name = String(user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Aspirant").slice(0, 50);
        const created = await supabase.from("profiles").insert({ id: user.id, display_name: name.length < 2 ? "Aspirant" : name }).select().single();
        if (created.error) throw created.error;
        found = created.data;
      }
      setProfile(found as Profile);
      const [logResult, attemptResult, discussionResult, replyResult] = await Promise.all([
        supabase.from("study_logs").select("*").order("study_date", { ascending: false }).limit(100),
        supabase.from("test_attempts").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("discussions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("replies").select("*").order("created_at", { ascending: true }).limit(500),
      ]);
      for (const result of [logResult, attemptResult, discussionResult, replyResult]) if (result.error) throw result.error;
      setLogs((logResult.data || []) as StudyLog[]);
      setAttempts((attemptResult.data || []) as Attempt[]);
      setDiscussions((discussionResult.data || []) as Discussion[]);
      setReplies((replyResult.data || []) as Reply[]);
    } catch (error) { setError((error as Error).message); }
    finally { setLoadingData(false); }
  }, [supabase, user]);

  useEffect(() => { if (user) void refresh(); else { setProfile(null); setLogs([]); setAttempts([]); } }, [user, refresh]);

  if (!supabase) return <main className="setup-page"><div className="setup-card"><div className="setup-theme"><ThemeToggle /></div><span className="wordmark">CA<span>Campus</span><i>.</i></span><p className="eyebrow">ONE SETUP STEP LEFT</p><h1>Connect your Supabase project.</h1><p>Copy <code>.env.local.example</code> to <code>.env.local</code>, paste your Project URL and publishable key, then restart <code>npm run dev</code>. Run <code>supabase/schema.sql</code> in the Supabase SQL Editor first.</p></div></main>;
  if (loading) return <div className="loading">Opening CA Campus…</div>;
  if (!user) return <Auth supabase={supabase} />;
  if (!profile) return <div className="loading">{error || "Setting up your study space…"}</div>;

  return <div className="app-shell"><aside className="sidebar"><div className="logo"><span>CA</span><strong>Campus<i>.</i></strong><small>FOUNDATION</small></div><p className="side-label">WORKSPACE</p><nav aria-label="Main navigation">{navigation.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-help"><b>Keep showing up.</b><p>One focused session today can change your week.</p></div><div className="user-menu"><span>{profile.display_name.slice(0, 1).toUpperCase()}</span><div><strong>{profile.display_name}</strong><small>CA Foundation aspirant</small></div></div><button className="logout" onClick={() => void supabase.auth.signOut()}>Log out ↗</button></div></aside><div className="main-area"><div className="topbar"><span>CA Campus <b>/ {navigation.find(item => item.id === view)?.label}</b></span><div className="topbar-actions"><ThemeToggle /><span className="study-status"><i /> Your study space</span><span className="top-avatar">{profile.display_name.slice(0, 1).toUpperCase()}</span></div></div><nav className="mobile-menu" aria-label="Mobile navigation">{navigation.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>{item.label}</button>)}</nav><main className="main-content">{error && <div className="notice error-text">{error} <button onClick={() => void refresh()}>Retry</button></div>}{loadingData && <div className="sync">Syncing your data…</div>}{view === "dashboard" && <Dashboard supabase={supabase} userId={user.id} profile={profile} logs={logs} attempts={attempts} refresh={refresh} goToTests={() => setView("tests")} />}{view === "tests" && <Tests supabase={supabase} attempts={attempts} refresh={refresh} />}{view === "rooms" && <Rooms supabase={supabase} userId={user.id} profile={profile} />}{view === "community" && <Community supabase={supabase} userId={user.id} profile={profile} discussions={discussions} replies={replies} refresh={refresh} />}{view === "notes" && <Notes supabase={supabase} userId={user.id} />}{view === "resources" && <Resources />}{view === "settings" && <Settings supabase={supabase} profile={profile} refresh={refresh} />}<footer>CA Campus is an independent study tool and is not affiliated with ICAI.</footer></main></div></div>;
}
