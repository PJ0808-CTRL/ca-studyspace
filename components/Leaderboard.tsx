"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ALL_BADGES,
  RANK_TIERS,
  generateLeaderboard,
  getGamificationData,
  getRankProgress,
  getRankTier,
  getStreakMultiplier,
  type Badge,
  type GamificationState,
  type LeaderboardEntry,
} from "@/lib/gamification";
import type { Profile } from "@/lib/types";

export default function Leaderboard({
  supabase,
  userId,
  profile,
}: {
  supabase: SupabaseClient;
  userId: string;
  profile: Profile;
}) {
  const [gameState, setGameState] = useState<GamificationState>(() => getGamificationData(userId));
  const [tab, setTab] = useState<"all" | "hierarchy" | "trophy">("all");
  const [trophyCategory, setTrophyCategory] = useState<string>("all");
  const [remoteProfiles, setRemoteProfiles] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const handleUpdate = () => {
      setGameState(getGamificationData(userId));
    };
    window.addEventListener("ca-gamification-updated", handleUpdate);
    return () => window.removeEventListener("ca-gamification-updated", handleUpdate);
  }, [userId]);

  // Fetch real profiles from Supabase if available
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, display_name, xp, streak, rank_tier")
          .limit(50);

        if (!error && data && data.length > 0 && alive) {
          const mapped: LeaderboardEntry[] = data
            .filter(p => p.id !== userId) // Current user handled separately
            .map(p => {
              const xp = Number(p.xp) || 0;
              return {
                id: p.id,
                name: p.display_name || "Aspirant",
                xp,
                streak: Number(p.streak) || 0,
                tier: getRankTier(xp),
                verifiedHours: Math.round((xp / 90) * 10) / 10,
                isCurrentUser: false,
              };
            });
          setRemoteProfiles(mapped);
        }
      } catch {
        // Fall back gracefully to local benchmarking
      }
    })();
    return () => {
      alive = false;
    };
  }, [supabase, userId]);

  const baseLeaderboard = generateLeaderboard(
    { id: userId, name: profile.display_name },
    gameState
  );

  // Merge remote profiles if present
  const mergedLeaderboard = (() => {
    if (remoteProfiles.length === 0) return baseLeaderboard;
    const currentEntry = baseLeaderboard.find(e => e.isCurrentUser);
    const combined = [
      ...(currentEntry ? [currentEntry] : []),
      ...remoteProfiles,
      ...baseLeaderboard.filter(e => !e.isCurrentUser && !remoteProfiles.some(r => r.name === e.name)),
    ];
    combined.sort((a, b) => b.xp - a.xp);
    return combined;
  })();

  const rankProgress = getRankProgress(gameState.xp);
  const streakInfo = getStreakMultiplier(gameState.streak);
  const userRankPosition = mergedLeaderboard.findIndex(e => e.isCurrentUser) + 1;

  const top3 = mergedLeaderboard.slice(0, 3);
  const unlockedBadgesSet = new Set(gameState.unlockedBadgeIds);

  const filteredBadges = ALL_BADGES.filter(b => {
    if (trophyCategory === "all") return true;
    if (trophyCategory === "unlocked") return unlockedBadgesSet.has(b.id);
    return b.category === trophyCategory;
  });

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">COMPETITIVE ASPIRANT ARENA · VERIFIED FOCUS ONLY</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1>All-India Aspirant Leaderboard</h1>
            <p>Compete with dedicated CA Foundation aspirants. Ranks are powered exclusively by verified Pomodoro focus and active revision drills.</p>
          </div>
          <div className="leaderboard-header-actions">
            <button
              className={`preset-btn ${tab === "trophy" ? "active" : ""}`}
              onClick={() => setTab("trophy")}
            >
              🎖️ Trophy Case ({gameState.unlockedBadgeIds.length}/{ALL_BADGES.length})
            </button>
            <button
              className={`preset-btn outline ${tab === "hierarchy" ? "active" : ""}`}
              onClick={() => setTab("hierarchy")}
            >
              ℹ️ Rank Hierarchy Guide
            </button>
          </div>
        </div>
      </header>

      {/* User Standing Strip */}
      <section className="card user-standing-strip">
        <div className="standing-tier-badge" style={{ borderColor: rankProgress.currentTier.color }}>
          <span className="standing-icon">{rankProgress.currentTier.badge}</span>
          <div>
            <div className="standing-tier-name" style={{ color: rankProgress.currentTier.color }}>
              {rankProgress.currentTier.name} Tier
            </div>
            <small>{rankProgress.currentTier.tagline}</small>
          </div>
        </div>

        <div className="standing-stats">
          <div className="standing-stat-item">
            <span>YOUR LEADERBOARD RANK</span>
            <strong>#{userRankPosition || 1}</strong>
          </div>
          <div className="standing-stat-item">
            <span>VERIFIED XP</span>
            <strong>{gameState.xp.toLocaleString()} XP</strong>
          </div>
          <div className="standing-stat-item">
            <span>ACTIVE STREAK</span>
            <strong className="flame-text">🔥 {gameState.streak} Days ({streakInfo.multiplier}x)</strong>
          </div>
          <div className="standing-stat-item">
            <span>VERIFIED FOCUS TIME</span>
            <strong>{Math.round((gameState.verifiedMinutes / 60) * 10) / 10} hrs</strong>
          </div>
        </div>

        <div className="standing-progress-box">
          <div className="progress-label-row">
            <span>
              {rankProgress.nextTier
                ? `Next: ${rankProgress.nextTier.badge} ${rankProgress.nextTier.name}`
                : "Max Rank Achieved"}
            </span>
            <span>
              {rankProgress.nextTier
                ? `${rankProgress.xpNeededForNext.toLocaleString()} XP needed`
                : "Legendary Status"}
            </span>
          </div>
          <div className="rank-progress-track">
            <div
              className="rank-progress-fill"
              style={{
                width: `${rankProgress.progressPercent}%`,
                background: rankProgress.currentTier.color,
              }}
            />
          </div>
        </div>
      </section>

      {/* Anti-Cheat Transparency Pill */}
      <div className="anti-cheat-banner">
        <span>🛡️ <b>Fair Play Guarantee:</b> Manual study logs do not grant XP. Rank tiers and leaderboards are earned strictly via verified Pomodoro sessions and recall drills to prevent false logging.</span>
      </div>

      {/* Navigation sub-tabs */}
      <div className="community-tabs" style={{ marginTop: 16, marginBottom: 20 }}>
        <button
          className={tab === "all" ? "active" : ""}
          onClick={() => setTab("all")}
        >
          🏆 Aspirant Rankings
        </button>
        <button
          className={tab === "trophy" ? "active" : ""}
          onClick={() => setTab("trophy")}
        >
          🎖️ Trophy Case ({gameState.unlockedBadgeIds.length} Unlocked)
        </button>
        <button
          className={tab === "hierarchy" ? "active" : ""}
          onClick={() => setTab("hierarchy")}
        >
          🔰 Rank Hierarchy (Plastic ➔ Grandmaster)
        </button>
      </div>

      {tab === "all" && (
        <>
          {/* Top 3 Podium */}
          <div className="podium-container">
            {top3[1] && (
              <div className="podium-card podium-silver">
                <div className="podium-crown">🥈 2nd Place</div>
                <div className="podium-avatar">{top3[1].name.charAt(0)}</div>
                <strong className="podium-name">{top3[1].name}</strong>
                <span className="tier-tag" style={{ color: top3[1].tier.color, borderColor: top3[1].tier.color }}>
                  {top3[1].tier.badge} {top3[1].tier.name}
                </span>
                <span className="podium-xp">{top3[1].xp.toLocaleString()} XP</span>
                <small className="podium-time">{top3[1].verifiedHours}h verified focus</small>
              </div>
            )}

            {top3[0] && (
              <div className="podium-card podium-gold">
                <div className="podium-crown">👑 1st Champion</div>
                <div className="podium-avatar gold-glow">{top3[0].name.charAt(0)}</div>
                <strong className="podium-name">{top3[0].name}</strong>
                <span className="tier-tag" style={{ color: top3[0].tier.color, borderColor: top3[0].tier.color }}>
                  {top3[0].tier.badge} {top3[0].tier.name}
                </span>
                <span className="podium-xp">{top3[0].xp.toLocaleString()} XP</span>
                <small className="podium-time">{top3[0].verifiedHours}h verified focus</small>
              </div>
            )}

            {top3[2] && (
              <div className="podium-card podium-bronze">
                <div className="podium-crown">🥉 3rd Place</div>
                <div className="podium-avatar">{top3[2].name.charAt(0)}</div>
                <strong className="podium-name">{top3[2].name}</strong>
                <span className="tier-tag" style={{ color: top3[2].tier.color, borderColor: top3[2].tier.color }}>
                  {top3[2].tier.badge} {top3[2].tier.name}
                </span>
                <span className="podium-xp">{top3[2].xp.toLocaleString()} XP</span>
                <small className="podium-time">{top3[2].verifiedHours}h verified focus</small>
              </div>
            )}
          </div>

          {/* Full Leaderboard Table */}
          <section className="card leaderboard-table-card">
            <div className="section-title split">
              <div>
                <p className="eyebrow">ALL-INDIA STANDINGS</p>
                <h3>Verified Aspirant Standings</h3>
              </div>
              <span className="fine">Updated live from verified study records</span>
            </div>

            <div className="table-responsive">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>Rank</th>
                    <th>Aspirant</th>
                    <th>Rank Tier</th>
                    <th>Verified Focus</th>
                    <th>Streak</th>
                    <th style={{ textAlign: "right" }}>Total XP</th>
                  </tr>
                </thead>
                <tbody>
                  {mergedLeaderboard.map((entry, idx) => {
                    const isUser = entry.isCurrentUser;
                    const rankNum = idx + 1;
                    return (
                      <tr key={entry.id} className={isUser ? "current-user-row" : ""}>
                        <td className="rank-cell">
                          {rankNum === 1 ? "🥇 1" : rankNum === 2 ? "🥈 2" : rankNum === 3 ? "🥉 3" : `#${rankNum}`}
                        </td>
                        <td>
                          <div className="aspirant-cell">
                            <span className="mini-avatar">{entry.name.charAt(0)}</span>
                            <div>
                              <strong>{entry.name}</strong>
                              {isUser && <span className="you-pill">YOU</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className="tier-pill"
                            style={{
                              color: entry.tier.color,
                              borderColor: `${entry.tier.color}66`,
                              backgroundColor: `${entry.tier.color}15`,
                            }}
                          >
                            <i>{entry.tier.badge}</i> {entry.tier.name}
                          </span>
                        </td>
                        <td>{entry.verifiedHours} hrs</td>
                        <td>
                          <span className="streak-cell">🔥 {entry.streak}d</span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <strong className="xp-cell">{entry.xp.toLocaleString()} XP</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === "trophy" && (
        <section className="card trophy-case-card">
          <div className="section-title split">
            <div>
              <p className="eyebrow">YOUR ACHIEVEMENT SHOWCASE</p>
              <h3>CA Studyspace Trophy Case</h3>
              <p className="subtle">Collect badges by maintaining consistency, mastering subjects, and completing verified focus blocks.</p>
            </div>
            <div className="badge-filter-buttons">
              <button
                className={`mini-filter-btn ${trophyCategory === "all" ? "active" : ""}`}
                onClick={() => setTrophyCategory("all")}
              >
                All ({ALL_BADGES.length})
              </button>
              <button
                className={`mini-filter-btn ${trophyCategory === "unlocked" ? "active" : ""}`}
                onClick={() => setTrophyCategory("unlocked")}
              >
                Unlocked ({gameState.unlockedBadgeIds.length})
              </button>
              <button
                className={`mini-filter-btn ${trophyCategory === "focus" ? "active" : ""}`}
                onClick={() => setTrophyCategory("focus")}
              >
                Focus
              </button>
              <button
                className={`mini-filter-btn ${trophyCategory === "streak" ? "active" : ""}`}
                onClick={() => setTrophyCategory("streak")}
              >
                Streaks
              </button>
              <button
                className={`mini-filter-btn ${trophyCategory === "subject" ? "active" : ""}`}
                onClick={() => setTrophyCategory("subject")}
              >
                Subjects
              </button>
            </div>
          </div>

          <div className="badges-grid">
            {filteredBadges.map(badge => {
              const isUnlocked = unlockedBadgesSet.has(badge.id);
              return (
                <div key={badge.id} className={`badge-card ${isUnlocked ? "unlocked" : "locked"}`}>
                  <div className="badge-icon-wrap">
                    <span className="badge-emoji">{badge.icon}</span>
                    {isUnlocked ? (
                      <span className="badge-check-icon">✓</span>
                    ) : (
                      <span className="badge-lock-icon">🔒</span>
                    )}
                  </div>
                  <strong className="badge-title">{badge.name}</strong>
                  <p className="badge-desc">{badge.description}</p>
                  {!isUnlocked && <span className="badge-hint">{badge.hint}</span>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === "hierarchy" && (
        <section className="card rank-hierarchy-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">RANK PROGRESSION SYSTEM</p>
              <h3>The 9 CA Studyspace Rank Tiers</h3>
              <p className="subtle">Every tier reflects actual verified hours, deep Pomodoro focus, and recall discipline.</p>
            </div>
          </div>

          <div className="hierarchy-list">
            {RANK_TIERS.map((tier, idx) => {
              const isCurrent = tier.id === rankProgress.currentTier.id;
              const isPassed = gameState.xp >= tier.minXp;
              return (
                <div
                  key={tier.id}
                  className={`hierarchy-tier-card ${isCurrent ? "current" : ""} ${isPassed ? "passed" : ""}`}
                  style={{ borderLeftColor: tier.color }}
                >
                  <div className="tier-card-left">
                    <span className="tier-rank-number">#{idx + 1}</span>
                    <span className="tier-large-badge">{tier.badge}</span>
                    <div>
                      <div className="tier-title-row">
                        <h4 style={{ color: tier.color }}>{tier.name}</h4>
                        {isCurrent && <span className="current-badge-pill">YOUR CURRENT RANK</span>}
                      </div>
                      <span className="tier-subtitle">{tier.tagline}</span>
                    </div>
                  </div>

                  <div className="tier-card-right">
                    <div className="tier-threshold">
                      <strong>
                        {tier.maxXp === Infinity
                          ? `${tier.minXp.toLocaleString()}+ XP`
                          : `${tier.minXp.toLocaleString()} - ${tier.maxXp.toLocaleString()} XP`}
                      </strong>
                      <small>Required Threshold</small>
                    </div>
                    <p className="tier-perk-desc">{tier.perks}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
