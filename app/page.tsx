"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import Auth from "@/components/Auth";
import Landing from "@/components/Landing";
import Dashboard from "@/components/Dashboard";
import StudyPlan from "@/components/StudyPlan";
import Pomodoro from "@/components/Pomodoro";
import Rooms from "@/components/Rooms";
import Notes from "@/components/Notes";
import Community from "@/components/Community";
import Resources from "@/components/Resources";
import Settings from "@/components/Settings";
import ThemeToggle from "@/components/ThemeToggle";
import ModeratorAuth from "@/components/ModeratorAuth";
import Leaderboard from "@/components/Leaderboard";
import RankEmblem from "@/components/RankEmblem";
import { getGamificationData, getRankTier, type Badge, type RankTier } from "@/lib/gamification";
import { getSupabase } from "@/lib/supabase";
import { isModeratorActive, activateModeratorSession, deactivateModeratorSession, verifyModeratorPasscode } from "@/lib/moderation";
import type { Discussion, Profile, Reply, StudyLog } from "@/lib/types";

type View = "dashboard" | "plan" | "pomodoro" | "leaderboard" | "rooms" | "community" | "notes" | "resources" | "settings";
const navigation: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "plan", label: "Study plan", icon: "◫" },
  { id: "pomodoro", label: "Pomodoro", icon: "◷" },
  { id: "leaderboard", label: "Leaderboard", icon: "◈" },
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
  const [authScreen, setAuthScreen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "moderator">("signup");
  const [isModerator, setIsModerator] = useState(false);
  const [moderatorModalOpen, setModeratorModalOpen] = useState(false);
  const [modPasscodeInput, setModPasscodeInput] = useState("");
  const [modPasscodeError, setModPasscodeError] = useState("");
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("dashboard");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [gameState, setGameState] = useState(() => getGamificationData(user?.id || ""));
  const [xpToast, setXpToast] = useState<{
    addedXp: number;
    reason: string;
    multiplier?: number;
    leveledUp?: boolean;
    newTier?: RankTier;
    newlyUnlockedBadges?: Badge[];
  } | null>(null);

  useEffect(() => {
    if (user) {
      setGameState(getGamificationData(user.id));
    }
  }, [user]);

  useEffect(() => {
    const handleGamification = () => {
      if (user) setGameState(getGamificationData(user.id));
    };
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setXpToast(detail);
        setTimeout(() => setXpToast(null), 4500);
      }
    };
    window.addEventListener("ca-gamification-updated", handleGamification);
    window.addEventListener("ca-xp-toast", handleToast);
    return () => {
      window.removeEventListener("ca-gamification-updated", handleGamification);
      window.removeEventListener("ca-xp-toast", handleToast);
    };
  }, [user]);

  const userTier = getRankTier(gameState.xp);

  useEffect(() => {
    if (user) {
      setIsModerator(isModeratorActive(user.id));
    } else {
      setIsModerator(false);
    }
  }, [user]);

  function handleUnlockModerator(e: React.FormEvent) {
    e.preventDefault();
    if (verifyModeratorPasscode(modPasscodeInput)) {
      activateModeratorSession(user?.id);
      setIsModerator(true);
      setModeratorModalOpen(false);
      setModPasscodeInput("");
      setModPasscodeError("");
    } else {
      setModPasscodeError("Invalid moderator security password. Access denied.");
    }
  }

  function handleLockModerator() {
    deactivateModeratorSession(user?.id);
    setIsModerator(false);
    setProfileMenuOpen(false);
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;

    // Check for PKCE confirmation code in URL when user clicks email confirmation link
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
          if (data?.session?.user && alive) {
            setUser(data.session.user);
            setLoading(false);
          }
          window.history.replaceState({}, document.title, window.location.pathname);
        }).catch(() => {});
      }
    }

    supabase.auth.getUser().then(({ data }) => { if (alive) { setUser(data.user); setLoading(false); } });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => { if (alive) { setUser(session?.user ?? null); setLoading(false); } });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [supabase]);

  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest(".profile-menu-container")) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener("click", handleDocClick);
      return () => document.removeEventListener("click", handleDocClick);
    }
  }, [profileMenuOpen]);

  const refreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!supabase || !user) return;
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setLoadingData(true); setError("");
    try {
      let { data: found, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (profileError && !profileError.message.includes("profiles_pkey") && !profileError.message.includes("duplicate key")) {
        throw profileError;
      }

      const rawName = String(user.user_metadata?.display_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Aspirant").trim().slice(0, 50);
      const safeName = rawName.length < 2 ? "Aspirant" : rawName;

      if (!found) {
        // Safe upsert prevents "duplicate key value violates unique constraint profiles_pkey"
        const upsertRes = await supabase
          .from("profiles")
          .upsert({ id: user.id, display_name: safeName }, { onConflict: "id" })
          .select()
          .maybeSingle();

        if (upsertRes.data) {
          found = upsertRes.data;
        } else {
          // Fallback refetch in case another process/trigger created the profile concurrently
          const refetch = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
          found = refetch.data || { id: user.id, display_name: safeName };
        }
      }

      // Trigger welcome email whenever user is logged in (session-debounced to avoid duplicate emails on rapid page refresh)
      if (user.email) {
        const sessionKey = `ca_welcome_session_${user.id}`;
        if (typeof window !== "undefined" && !sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, "true");
          const displayName = String(found?.display_name || user.user_metadata?.name || safeName);
          void fetch("/api/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: user.email, name: displayName }),
          }).then(res => res.json()).then(data => {
            console.log("[Welcome Email] Result:", data);
          }).catch(err => {
            console.warn("[Welcome Email] Failed:", err);
          });
        }
      }

      setProfile(found as Profile);
      const [logResult, discussionResult, replyResult] = await Promise.all([
        supabase.from("study_logs").select("*").order("study_date", { ascending: false }).limit(100),
        supabase.from("discussions").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("replies").select("*").order("created_at", { ascending: true }).limit(500),
      ]);
      for (const result of [logResult, discussionResult, replyResult]) if (result.error) throw result.error;
      setLogs((logResult.data || []) as StudyLog[]);
      setDiscussions((discussionResult.data || []) as Discussion[]);
      setReplies((replyResult.data || []) as Reply[]);
    } catch (error) {
      const msg = (error as Error).message || "";
      if (!msg.includes("profiles_pkey") && !msg.includes("duplicate key")) {
        setError(msg);
      }
    } finally {
      refreshingRef.current = false;
      setLoadingData(false);
    }
  }, [supabase, user]);

  useEffect(() => { if (user) void refresh(); else { setProfile(null); setLogs([]); } }, [user, refresh]);

  if (!supabase) return <main className="setup-page"><div className="setup-card"><div className="setup-theme"><ThemeToggle /></div><span className="wordmark">CA <span>Orbit</span><i>.</i></span><p className="eyebrow">ONE SETUP STEP LEFT</p><h1>Connect your Supabase project.</h1><p>Copy <code>.env.local.example</code> to <code>.env.local</code>, paste your Project URL and publishable key, then restart <code>npm run dev</code>. Run <code>supabase/schema.sql</code> in the Supabase SQL Editor first.</p></div></main>;
  if (loading) return <div className="loading">Opening CA Orbit…</div>;
  if (!user) {
    return authScreen ? (
      authMode === "moderator" ? (
        <ModeratorAuth
          supabase={supabase}
          onBack={() => setAuthScreen(false)}
          onAuthenticated={() => {
            setIsModerator(true);
            setAuthScreen(false);
          }}
        />
      ) : (
        <div className="auth-screen-wrap">
          <button className="auth-back" type="button" onClick={() => setAuthScreen(false)}>← Back to homepage</button>
          <Auth key={authMode} supabase={supabase} initialMode={authMode} />
        </div>
      )
    ) : (
      <Landing
        onStart={() => { setAuthMode("signup"); setAuthScreen(true); }}
        onLogin={() => { setAuthMode("login"); setAuthScreen(true); }}
        onModerator={() => { setAuthMode("moderator"); setAuthScreen(true); }}
      />
    );
  }
  if (!profile) return <div className="loading">{error || "Setting up your study space…"}</div>;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <span>CA</span><strong>Orbit<i>.</i></strong>
          <small>FOUNDATION</small>
        </div>
        <p className="side-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {navigation.map(item => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
            >
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <b>Keep showing up.</b>
            <p>One focused session today can change your week.</p>
          </div>
          <div className="user-menu">
            <span>{profile.display_name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{profile.display_name}</strong>
              <small>CA Foundation aspirant</small>
            </div>
          </div>
          <button className="logout" onClick={() => void supabase.auth.signOut()}>Log out ↗</button>
        </div>
      </aside>

      <div className="main-area">
        <div className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-toggle"
              onClick={() => setMobileDrawerOpen(prev => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileDrawerOpen}
            >
              <span>☰</span>
            </button>
            <span className="topbar-breadcrumb">
              CA Orbit <b>/ {navigation.find(item => item.id === view)?.label}</b>
            </span>
          </div>

          <div className="topbar-actions">
            <ThemeToggle />
            {user && (
              <button
                type="button"
                className="topbar-rank-pill"
                onClick={() => setView("leaderboard")}
                title="View All-India Leaderboard & Trophies"
              >
                <RankEmblem tier={userTier.id} size={18} />
                <b>{userTier.name}</b>
                <small>{gameState.xp.toLocaleString()} XP</small>
              </button>
            )}
            {isModerator ? (
              <span className="moderator-active-pill" title="Moderation Mode Enabled">
                <i>🛡️</i> Moderator
              </span>
            ) : (
              <span className="study-status"><i /> Your study space</span>
            )}
            <div className="profile-menu-container">
              <button
                className="top-avatar"
                onClick={() => setProfileMenuOpen(prev => !prev)}
                aria-label="User menu"
                aria-expanded={profileMenuOpen}
              >
                {profile.display_name.slice(0, 1).toUpperCase()}
              </button>
              {profileMenuOpen && (
                <div className="profile-dropdown" role="menu">
                  <div className="profile-dropdown-header">
                    <strong>{profile.display_name}</strong>
                    <small>{isModerator ? "Verified Moderator" : `${userTier.name} Tier Aspirant`}</small>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button
                    className="profile-dropdown-item"
                    onClick={() => { setView("leaderboard"); setProfileMenuOpen(false); }}
                  >
                    <span>◈</span> Leaderboard & Trophies
                  </button>
                  <button
                    className="profile-dropdown-item"
                    onClick={() => { setView("settings"); setProfileMenuOpen(false); }}
                  >
                    <span>⚙</span> My profile & target
                  </button>
                  {isModerator ? (
                    <button
                      className="profile-dropdown-item"
                      onClick={handleLockModerator}
                      style={{ color: "#b3402d" }}
                    >
                      <span>🔒</span> Exit Moderator Mode
                    </button>
                  ) : (
                    <button
                      className="profile-dropdown-item"
                      onClick={() => { setModeratorModalOpen(true); setProfileMenuOpen(false); }}
                    >
                      <span>🛡️</span> Moderator Login
                    </button>
                  )}
                  <button
                    className="profile-dropdown-item danger"
                    onClick={() => { setProfileMenuOpen(false); setIsModerator(false); void supabase.auth.signOut(); }}
                  >
                    <span>↗</span> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <nav className="mobile-menu" aria-label="Mobile navigation">
          {navigation.map(item => (
            <button
              key={item.id}
              className={view === item.id ? "active" : ""}
              onClick={() => setView(item.id)}
            >
              <span className="mobile-tab-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {mobileDrawerOpen && (
          <div className="drawer-overlay" onClick={() => setMobileDrawerOpen(false)}>
            <aside className="mobile-drawer" onClick={e => e.stopPropagation()}>
              <div className="mobile-drawer-head">
                <div className="logo">
                  <span>CA</span><strong>Orbit<i>.</i></strong>
                  <small>FOUNDATION</small>
                </div>
                <button
                  className="drawer-close"
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <p className="side-label">WORKSPACE</p>
              <nav className="drawer-nav">
                {navigation.map(item => (
                  <button
                    key={item.id}
                    className={view === item.id ? "active" : ""}
                    onClick={() => { setView(item.id); setMobileDrawerOpen(false); }}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
              <div className="drawer-footer">
                <div className="sidebar-help">
                  <b>Keep showing up.</b>
                  <p>One focused session today can change your week.</p>
                </div>
                <div className="user-menu">
                  <span>{profile.display_name.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{profile.display_name}</strong>
                    <small>CA Foundation aspirant</small>
                  </div>
                </div>
                <button
                  className="logout"
                  onClick={() => { setMobileDrawerOpen(false); setIsModerator(false); void supabase.auth.signOut(); }}
                >
                  Log out ↗
                </button>
              </div>
            </aside>
          </div>
        )}

        <main className="main-content">
          {error && <div className="notice error-text">{error} <button onClick={() => void refresh()}>Retry</button></div>}
          {loadingData && <div className="sync">Syncing your data…</div>}
          {view === "dashboard" && <Dashboard supabase={supabase} userId={user.id} profile={profile} logs={logs} refresh={refresh} onNavigate={target => setView(target as View)} />}
          {view === "plan" && <StudyPlan supabase={supabase} userId={user.id} />}
          <div hidden={view !== "pomodoro"}>
            <Pomodoro supabase={supabase} userId={user.id} refresh={refresh} />
          </div>
          {view === "leaderboard" && <Leaderboard supabase={supabase} userId={user.id} profile={profile} />}
          {view === "rooms" && <Rooms supabase={supabase} userId={user.id} profile={profile} isModerator={isModerator} />}
          {view === "community" && <Community supabase={supabase} userId={user.id} profile={profile} discussions={discussions} replies={replies} refresh={refresh} isModerator={isModerator} />}
          {view === "notes" && <Notes supabase={supabase} userId={user.id} isModerator={isModerator} />}
          {view === "resources" && <Resources />}
          {view === "settings" && <Settings supabase={supabase} profile={profile} refresh={refresh} />}
          <footer>
            <div className="app-footer-bar">
              <span>CA Orbit is an independent study tool and is not affiliated with ICAI.</span>
              <div className="app-legal-footer-links">
                <a href="/about" target="_blank" rel="noopener noreferrer">About Us</a>
                <span>·</span>
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                <span>·</span>
                <a href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
              </div>
            </div>
          </footer>

          {/* Real-time Floating XP & Rank Toast */}
          {xpToast && (
            <div className={`global-xp-toast ${xpToast.leveledUp ? "level-up" : ""}`}>
              <div className="xp-toast-icon">
                <RankEmblem tier={xpToast.newTier?.id || userTier.id} size={28} />
              </div>
              <div className="xp-toast-body">
                {xpToast.leveledUp ? (
                  <>
                    <strong>Rank Up: Reached {xpToast.newTier?.name} Tier</strong>
                    <span>+{xpToast.addedXp} XP · {xpToast.reason}</span>
                  </>
                ) : (
                  <>
                    <strong>+{xpToast.addedXp} Verified XP Earned</strong>
                    <span>{xpToast.reason}</span>
                  </>
                )}
                {xpToast.newlyUnlockedBadges && xpToast.newlyUnlockedBadges.length > 0 && (
                  <small className="toast-badge-notice">
                    Unlocked: {xpToast.newlyUnlockedBadges.map(b => b.name).join(", ")}
                  </small>
                )}
              </div>
            </div>
          )}
        </main>

        {moderatorModalOpen && (
          <div className="report-modal-overlay" onClick={() => setModeratorModalOpen(false)}>
            <div className="report-modal-card mod-inapp-modal" onClick={e => e.stopPropagation()}>
              <div className="report-modal-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>🛡️</span>
                  <h3 style={{ margin: 0 }}>Unlock Moderator Mode</h3>
                </div>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setModeratorModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <p className="fine" style={{ margin: "10px 0 16px" }}>
                Enter the secret moderator security password to enable room moderation mode and message deletion.
              </p>
              <form onSubmit={handleUnlockModerator} className="form-stack">
                <label>
                  <span>🔑</span> Moderator Security Password
                  <input
                    type="password"
                    value={modPasscodeInput}
                    onChange={e => {
                      setModPasscodeInput(e.target.value);
                      setModPasscodeError("");
                    }}
                    placeholder="Enter moderator security password"
                    autoFocus
                    required
                  />
                </label>
                {modPasscodeError && (
                  <p className="notice error-text" style={{ margin: "4px 0" }}>
                    {modPasscodeError}
                  </p>
                )}
                <div className="report-modal-actions">
                  <button
                    type="button"
                    className="back"
                    onClick={() => setModeratorModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button className="primary" style={{ minHeight: 38 }}>
                    Verify & Unlock 🛡️
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
