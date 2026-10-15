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
import RankEmblem from "./RankEmblem";

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
  const [tab, setTab] = useState<"standings" | "trophy" | "hierarchy">("standings");
  const [trophyCategory, setTrophyCategory] = useState<string>("all");
  const [remoteProfiles, setRemoteProfiles] = useState<LeaderboardEntry[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setGameState(getGamificationData(userId));
    };
    window.addEventListener("ca-gamification-updated", handleUpdate);
    return () => window.removeEventListener("ca-gamification-updated", handleUpdate);
  }, [userId]);

  // Fetch only real profiles from Supabase database
  useEffect(() => {
    let alive = true;
    void (async () => {
      setLoadingUsers(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, display_name, xp, streak, rank_tier")
          .limit(100);

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
        // Fall back gracefully
      } finally {
        if (alive) setLoadingUsers(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [supabase, userId]);

  // Base leaderboard contains ONLY the current real user
  const baseLeaderboard = generateLeaderboard(
    { id: userId, name: profile.display_name },
    gameState
  );

  // Merge real remote users with current user - zero fake/seeded users
  const mergedLeaderboard = (() => {
    const currentEntry = baseLeaderboard[0];
    const combined = [
      currentEntry,
      ...remoteProfiles.filter(r => r.id !== userId),
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
        <h1>All-India Aspirant Leaderboard</h1>
        <p>Compete with fellow CA Foundation aspirants. Standings are determined strictly by verified Pomodoro focus and active revision mastery.</p>
      </header>

      {/* User Standing Strip */}
      <section className="card user-standing-strip">
        <div className="standing-tier-badge" style={{ borderColor: `${rankProgress.currentTier.color}44` }}>
          <RankEmblem tier={rankProgress.currentTier.id} size={54} />
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
            <strong className="flame-text">{gameState.streak} Days ({streakInfo.multiplier}x)</strong>
          </div>
          <div className="standing-stat-item">
            <span>VERIFIED FOCUS TIME</span>
            <strong>{Math.round((gameState.verifiedMinutes / 60) * 10) / 10} hrs</strong>
          </div>
        </div>

        <div className="standing-progress-box">
          <div className="progress-label-row">
            <span>
              {rankProgress.nextTier ? `Next: ${rankProgress.nextTier.name} Tier` : "Peak Grandmaster"}
            </span>
            <span>
              {rankProgress.nextTier
                ? `${rankProgress.xpNeededForNext.toLocaleString()} XP needed`
                : "All-India Rank Calibre"}
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

      {/* Sleek Modern Segmented Navigation Tabs */}
      <nav className="leaderboard-segmented-nav" aria-label="Leaderboard views">
        <button
          type="button"
          className={`leaderboard-nav-tab ${tab === "standings" ? "active" : ""}`}
          onClick={() => setTab("standings")}
        >
          Aspirants Standings
        </button>
        <button
          type="button"
          className={`leaderboard-nav-tab ${tab === "trophy" ? "active" : ""}`}
          onClick={() => setTab("trophy")}
        >
          Trophy Case ({gameState.unlockedBadgeIds.length}/{ALL_BADGES.length})
        </button>
        <button
          type="button"
          className={`leaderboard-nav-tab ${tab === "hierarchy" ? "active" : ""}`}
          onClick={() => setTab("hierarchy")}
        >
          Rank Hierarchy Guide
        </button>
      </nav>

      {tab === "standings" && (
        <div className="leaderboard-content-section">
          {/* Top 3 Podium (renders when multiple real users exist) */}
          {mergedLeaderboard.length >= 2 ? (
            <div className="podium-container">
              {top3[1] && (
                <div className="podium-card podium-silver">
                  <div className="podium-crown">Rank #2</div>
                  <div className="podium-emblem-wrap">
                    <RankEmblem tier={top3[1].tier.id} size={44} />
                  </div>
                  <strong className="podium-name">{top3[1].name}</strong>
                  <span className="tier-tag" style={{ color: top3[1].tier.color, borderColor: top3[1].tier.color }}>
                    {top3[1].tier.name}
                  </span>
                  <span className="podium-xp">{top3[1].xp.toLocaleString()} XP</span>
                  <small className="podium-time">{top3[1].verifiedHours}h focus</small>
                </div>
              )}

              {top3[0] && (
                <div className="podium-card podium-gold">
                  <div className="podium-crown">Rank #1 Leader</div>
                  <div className="podium-emblem-wrap gold-glow">
                    <RankEmblem tier={top3[0].tier.id} size={56} />
                  </div>
                  <strong className="podium-name">{top3[0].name}</strong>
                  <span className="tier-tag" style={{ color: top3[0].tier.color, borderColor: top3[0].tier.color }}>
                    {top3[0].tier.name}
                  </span>
                  <span className="podium-xp">{top3[0].xp.toLocaleString()} XP</span>
                  <small className="podium-time">{top3[0].verifiedHours}h focus</small>
                </div>
              )}

              {top3[2] && (
                <div className="podium-card podium-bronze">
                  <div className="podium-crown">Rank #3</div>
                  <div className="podium-emblem-wrap">
                    <RankEmblem tier={top3[2].tier.id} size={44} />
                  </div>
                  <strong className="podium-name">{top3[2].name}</strong>
                  <span className="tier-tag" style={{ color: top3[2].tier.color, borderColor: top3[2].tier.color }}>
                    {top3[2].tier.name}
                  </span>
                  <span className="podium-xp">{top3[2].xp.toLocaleString()} XP</span>
                  <small className="podium-time">{top3[2].verifiedHours}h focus</small>
                </div>
              )}
            </div>
          ) : (
            <div className="leaderboard-solo-card card">
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <RankEmblem tier={rankProgress.currentTier.id} size={42} />
                <div>
                  <strong>You are holding Rank #1 on the leaderboard</strong>
                  <p className="subtle" style={{ margin: "2px 0 0" }}>
                    Verified hours from your Pomodoro sessions and revision tests will keep your rank updated as new aspirants join.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Full Standings Table */}
          <section className="card leaderboard-table-card">
            <div className="section-title split">
              <div>
                <p className="eyebrow">ALL-INDIA STANDINGS</p>
                <h3>Verified Aspirant Standings</h3>
              </div>
              <span className="fine">Authentic registered student records</span>
            </div>

            <div className="table-responsive">
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th style={{ width: 64 }}>Rank</th>
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
                          #{rankNum}
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
                              borderColor: `${entry.tier.color}44`,
                              backgroundColor: `${entry.tier.color}15`,
                            }}
                          >
                            <RankEmblem tier={entry.tier.id} size={16} />
                            <span>{entry.tier.name}</span>
                          </span>
                        </td>
                        <td>{entry.verifiedHours} hrs</td>
                        <td>
                          <span className="streak-cell">{entry.streak}d</span>
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
        </div>
      )}

      {tab === "trophy" && (
        <div className="leaderboard-content-section">
          <section className="card trophy-case-card">
            <div className="section-title split">
              <div>
                <p className="eyebrow">ACHIEVEMENT SHOWCASE</p>
                <h3>CA Orbit Trophy Case</h3>
                <p className="subtle">Unlock badges through consistent Pomodoro focus blocks, subject mastery, and disciplined revisions.</p>
              </div>
              <div className="trophy-filter-strip">
                <button
                  type="button"
                  className={`trophy-chip ${trophyCategory === "all" ? "active" : ""}`}
                  onClick={() => setTrophyCategory("all")}
                >
                  All ({ALL_BADGES.length})
                </button>
                <button
                  type="button"
                  className={`trophy-chip ${trophyCategory === "unlocked" ? "active" : ""}`}
                  onClick={() => setTrophyCategory("unlocked")}
                >
                  Unlocked ({gameState.unlockedBadgeIds.length})
                </button>
                <button
                  type="button"
                  className={`trophy-chip ${trophyCategory === "focus" ? "active" : ""}`}
                  onClick={() => setTrophyCategory("focus")}
                >
                  Focus
                </button>
                <button
                  type="button"
                  className={`trophy-chip ${trophyCategory === "streak" ? "active" : ""}`}
                  onClick={() => setTrophyCategory("streak")}
                >
                  Streaks
                </button>
                <button
                  type="button"
                  className={`trophy-chip ${trophyCategory === "subject" ? "active" : ""}`}
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
                      <span className="badge-glyph-wrap">
                        {badge.id.startsWith("tier_") ? (
                          <RankEmblem tier={badge.id.replace("tier_", "")} size={28} />
                        ) : (
                          <span className="badge-symbol-core">◈</span>
                        )}
                      </span>
                      {isUnlocked ? (
                        <span className="badge-status-pill unlocked">Unlocked</span>
                      ) : (
                        <span className="badge-status-pill locked">Locked</span>
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
        </div>
      )}

      {tab === "hierarchy" && (
        <div className="leaderboard-content-section">
          <section className="card rank-hierarchy-card">
            <div className="section-title">
              <div>
                <p className="eyebrow">RANK PROGRESSION SYSTEM</p>
                <h3>The 9 CA Orbit Rank Tiers</h3>
                <p className="subtle">Each tier represents verified focus stamina and consistency. Progress through the tiers by completing live Pomodoro focus blocks and spaced revisions.</p>
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
                      <span className="tier-rank-number">0{idx + 1}</span>
                      <RankEmblem tier={tier.id} size={44} />
                      <div>
                        <div className="tier-title-row">
                          <h4 style={{ color: tier.color }}>{tier.name} Tier</h4>
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
                            : `${tier.minXp.toLocaleString()} – ${tier.maxXp.toLocaleString()} XP`}
                        </strong>
                        <small>Threshold</small>
                      </div>
                      <p className="tier-perk-desc">{tier.perks}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
