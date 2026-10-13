"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Subject } from "./subjects";

export type TierId =
  | "plastic"
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "grandmaster";

export type RankTier = {
  id: TierId;
  name: string;
  badge: string;
  minXp: number;
  maxXp: number;
  color: string;
  bgGradient: string;
  tagline: string;
  perks: string;
};

export const RANK_TIERS: RankTier[] = [
  {
    id: "plastic",
    name: "Plastic",
    badge: "🪣",
    minXp: 0,
    maxXp: 249,
    color: "#78909c",
    bgGradient: "linear-gradient(135deg, #78909c22, #cfd8dc33)",
    tagline: "Day 1 Aspirant",
    perks: "Starting the CA Foundation journey. Building foundation discipline.",
  },
  {
    id: "iron",
    name: "Iron",
    badge: "🔩",
    minXp: 250,
    maxXp: 699,
    color: "#607d8b",
    bgGradient: "linear-gradient(135deg, #607d8b22, #90a4ae33)",
    tagline: "Iron Discipline",
    perks: "Solidifying daily focus habits and beating initial inertia.",
  },
  {
    id: "bronze",
    name: "Bronze",
    badge: "🥉",
    minXp: 700,
    maxXp: 1499,
    color: "#cd7f32",
    bgGradient: "linear-gradient(135deg, #cd7f3222, #d7ccc833)",
    tagline: "Bronze Grinder",
    perks: "15+ hours of verified deep focus clocked.",
  },
  {
    id: "silver",
    name: "Silver",
    badge: "🥈",
    minXp: 1500,
    maxXp: 2999,
    color: "#9e9e9e",
    bgGradient: "linear-gradient(135deg, #9e9e9e22, #e0e0e033)",
    tagline: "Silver Scholar",
    perks: "High-retention conceptual mastery across subjects.",
  },
  {
    id: "gold",
    name: "Gold",
    badge: "🥇",
    minXp: 3000,
    maxXp: 5499,
    color: "#f59e0b",
    bgGradient: "linear-gradient(135deg, #f59e0b22, #fef3c733)",
    tagline: "Gold Contender",
    perks: "Elite study rhythm with high daily stamina.",
  },
  {
    id: "platinum",
    name: "Platinum",
    badge: "💿",
    minXp: 5500,
    maxXp: 8999,
    color: "#06b6d4",
    bgGradient: "linear-gradient(135deg, #06b6d422, #cffafe33)",
    tagline: "Platinum Strategist",
    perks: "Advanced illustration drills and speed problem solving.",
  },
  {
    id: "diamond",
    name: "Diamond",
    badge: "💎",
    minXp: 9000,
    maxXp: 14999,
    color: "#8b5cf6",
    bgGradient: "linear-gradient(135deg, #8b5cf622, #ede9fe33)",
    tagline: "Diamond Finisher",
    perks: "Top 5% verified focus hours across the community.",
  },
  {
    id: "master",
    name: "Master",
    badge: "👑",
    minXp: 15000,
    maxXp: 24999,
    color: "#ef4444",
    bgGradient: "linear-gradient(135deg, #ef444422, #fee2e233)",
    tagline: "Master Achiever",
    perks: "Unshakeable discipline ready for exam hall pressure.",
  },
  {
    id: "grandmaster",
    name: "Grandmaster",
    badge: "⚡",
    minXp: 25000,
    maxXp: Infinity,
    color: "#ec4899",
    bgGradient: "linear-gradient(135deg, #ec489922, #fce7f333)",
    tagline: "Grandmaster AIR",
    perks: "Supreme legendary dedication. All-India Rank calibre.",
  },
];

export type BadgeCategory = "focus" | "streak" | "subject" | "milestone" | "special";

export type Badge = {
  id: string;
  name: string;
  icon: string;
  category: BadgeCategory;
  description: string;
  hint: string;
};

export const ALL_BADGES: Badge[] = [
  {
    id: "first_focus",
    name: "First Focus",
    icon: "🍅",
    category: "focus",
    description: "Completed your first verified Pomodoro focus session.",
    hint: "Complete 1 Pomodoro session to unlock.",
  },
  {
    id: "focus_apprentice",
    name: "Focus Apprentice",
    icon: "⏳",
    category: "focus",
    description: "Completed 5 verified Pomodoro focus sessions.",
    hint: "Complete 5 Pomodoro sessions to unlock.",
  },
  {
    id: "deep_work_spartan",
    name: "Deep Work Spartan",
    icon: "🛡️",
    category: "focus",
    description: "Completed 25 verified Pomodoro focus sessions.",
    hint: "Complete 25 Pomodoro sessions to unlock.",
  },
  {
    id: "centurion_focus",
    name: "Centurion of Focus",
    icon: "💯",
    category: "focus",
    description: "Clocked 100 verified Pomodoro focus sessions.",
    hint: "Complete 100 Pomodoro sessions to unlock.",
  },
  {
    id: "streak_3",
    name: "On Fire",
    icon: "🔥",
    category: "streak",
    description: "Maintained a 3-day verified study streak.",
    hint: "Study 3 consecutive days to unlock.",
  },
  {
    id: "streak_7",
    name: "Iron Discipline",
    icon: "⚡",
    category: "streak",
    description: "Maintained a 7-day verified study streak.",
    hint: "Study 7 consecutive days to unlock.",
  },
  {
    id: "streak_14",
    name: "Unstoppable",
    icon: "🌟",
    category: "streak",
    description: "Maintained a 14-day verified study streak.",
    hint: "Study 14 consecutive days to unlock.",
  },
  {
    id: "streak_30",
    name: "Kal Par Mat Chhod Champion",
    icon: "👑",
    category: "streak",
    description: "30 days of relentless, uncompromised consistency.",
    hint: "Maintain a 30-day streak to unlock.",
  },
  {
    id: "acc_master",
    name: "Balance Sheet Master",
    icon: "⚖️",
    category: "subject",
    description: "Completed 5 verified focus sessions in Accounting.",
    hint: "Study Accounting with Pomodoro 5 times to unlock.",
  },
  {
    id: "law_master",
    name: "Corporate Counsel",
    icon: "📜",
    category: "subject",
    description: "Completed 5 verified focus sessions in Business Laws.",
    hint: "Study Business Laws with Pomodoro 5 times to unlock.",
  },
  {
    id: "qa_master",
    name: "Quants Conqueror",
    icon: "📐",
    category: "subject",
    description: "Completed 5 verified focus sessions in Quantitative Aptitude.",
    hint: "Study Quantitative Aptitude with Pomodoro 5 times to unlock.",
  },
  {
    id: "eco_master",
    name: "Market Economist",
    icon: "📈",
    category: "subject",
    description: "Completed 5 verified focus sessions in Business Economics.",
    hint: "Study Business Economics with Pomodoro 5 times to unlock.",
  },
  {
    id: "night_owl",
    name: "Midnight Grinder",
    icon: "🌙",
    category: "special",
    description: "Completed a verified session during the quiet hours (11 PM - 4 AM).",
    hint: "Finish a Pomodoro session late at night to unlock.",
  },
  {
    id: "early_bird",
    name: "Dawn Patrol",
    icon: "🌅",
    category: "special",
    description: "Completed a verified session before 7:00 AM.",
    hint: "Finish a Pomodoro session in early morning to unlock.",
  },
  {
    id: "memory_ace",
    name: "Memory Ace",
    icon: "🃏",
    category: "milestone",
    description: "Drilled spaced revisions or flashcards to solidify retention.",
    hint: "Complete a revision or flashcard drill to unlock.",
  },
  {
    id: "mock_warrior",
    name: "Mock Test Warrior",
    icon: "📝",
    category: "milestone",
    description: "Logged a full 4-paper mock exam score.",
    hint: "Save a full mock test breakdown to unlock.",
  },
  {
    id: "tier_iron",
    name: "Forged in Iron",
    icon: "🔩",
    category: "milestone",
    description: "Ascended from Plastic to Iron Tier.",
    hint: "Reach 250 XP to unlock.",
  },
  {
    id: "tier_bronze",
    name: "Bronze Vanguard",
    icon: "🥉",
    category: "milestone",
    description: "Reached Bronze Tier (700+ XP).",
    hint: "Reach 700 XP to unlock.",
  },
  {
    id: "tier_silver",
    name: "Silver Scholar",
    icon: "🥈",
    category: "milestone",
    description: "Reached Silver Tier (1,500+ XP).",
    hint: "Reach 1,500 XP to unlock.",
  },
  {
    id: "tier_gold",
    name: "Golden Aspirant",
    icon: "🥇",
    category: "milestone",
    description: "Reached Gold Tier (3,000+ XP).",
    hint: "Reach 3,000 XP to unlock.",
  },
];

export type GamificationState = {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  verifiedSessions: number;
  verifiedMinutes: number;
  unlockedBadgeIds: string[];
  subjectSessions: Record<string, number>;
  revisionsCompleted: number;
  flashcardsDrilled: number;
  mockTestsLogged: number;
};

const STORAGE_PREFIX = "ca_gamification_v1_";

const todayStr = () => new Date().toLocaleDateString("en-CA");
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString("en-CA");
};

export function getRankTier(xp: number): RankTier {
  const safeXp = Math.max(0, Math.floor(xp || 0));
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (safeXp >= RANK_TIERS[i].minXp) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
}

export function getRankProgress(xp: number): {
  currentTier: RankTier;
  nextTier: RankTier | null;
  currentTierXp: number;
  xpNeededForNext: number;
  progressPercent: number;
} {
  const currentTier = getRankTier(xp);
  const currentIndex = RANK_TIERS.findIndex(t => t.id === currentTier.id);
  const nextTier = currentIndex < RANK_TIERS.length - 1 ? RANK_TIERS[currentIndex + 1] : null;

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      currentTierXp: xp - currentTier.minXp,
      xpNeededForNext: 0,
      progressPercent: 100,
    };
  }

  const range = nextTier.minXp - currentTier.minXp;
  const progressInTier = Math.max(0, xp - currentTier.minXp);
  const percent = Math.min(100, Math.max(0, Math.round((progressInTier / range) * 100)));

  return {
    currentTier,
    nextTier,
    currentTierXp: progressInTier,
    xpNeededForNext: Math.max(0, nextTier.minXp - xp),
    progressPercent: percent,
  };
}

export function getStreakMultiplier(streakDays: number): { multiplier: number; label: string } {
  if (streakDays >= 30) return { multiplier: 1.5, label: "1.5x Mythic Boost (30+ Days)" };
  if (streakDays >= 14) return { multiplier: 1.4, label: "1.4x Champion Boost (14+ Days)" };
  if (streakDays >= 7) return { multiplier: 1.25, label: "1.25x Iron Boost (7+ Days)" };
  if (streakDays >= 3) return { multiplier: 1.1, label: "1.1x Focus Boost (3+ Days)" };
  return { multiplier: 1.0, label: "1.0x Base Rate" };
}

export function getGamificationData(userId: string): GamificationState {
  if (typeof window === "undefined" || !userId) {
    return {
      xp: 0,
      streak: 1,
      lastActiveDate: null,
      verifiedSessions: 0,
      verifiedMinutes: 0,
      unlockedBadgeIds: [],
      subjectSessions: {},
      revisionsCompleted: 0,
      flashcardsDrilled: 0,
      mockTestsLogged: 0,
    };
  }

  const key = `${STORAGE_PREFIX}${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Validate streak against current date
      let streak = parsed.streak || 0;
      const today = todayStr();
      const yesterday = yesterdayStr();
      if (parsed.lastActiveDate && parsed.lastActiveDate !== today && parsed.lastActiveDate !== yesterday) {
        // Streak broken
        streak = 0;
      }
      return {
        xp: Number(parsed.xp) || 0,
        streak: Math.max(0, streak),
        lastActiveDate: parsed.lastActiveDate || null,
        verifiedSessions: Number(parsed.verifiedSessions) || 0,
        verifiedMinutes: Number(parsed.verifiedMinutes) || 0,
        unlockedBadgeIds: Array.isArray(parsed.unlockedBadgeIds) ? parsed.unlockedBadgeIds : [],
        subjectSessions: parsed.subjectSessions || {},
        revisionsCompleted: Number(parsed.revisionsCompleted) || 0,
        flashcardsDrilled: Number(parsed.flashcardsDrilled) || 0,
        mockTestsLogged: Number(parsed.mockTestsLogged) || 0,
      };
    }
  } catch (err) {
    console.warn("Failed to parse gamification state from localStorage:", err);
  }

  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    verifiedSessions: 0,
    verifiedMinutes: 0,
    unlockedBadgeIds: [],
    subjectSessions: {},
    revisionsCompleted: 0,
    flashcardsDrilled: 0,
    mockTestsLogged: 0,
  };
}

function saveGamificationData(userId: string, state: GamificationState): void {
  if (typeof window === "undefined" || !userId) return;
  const key = `${STORAGE_PREFIX}${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to persist gamification state to localStorage:", err);
  }
}

export type AwardXPOptions = {
  userId: string;
  baseXp: number;
  reason: string;
  subject?: Subject;
  focusMinutes?: number;
  supabase?: SupabaseClient;
  isSpacedRevision?: boolean;
  isFlashcard?: boolean;
  isMockTest?: boolean;
};

export type AwardXPResult = {
  addedXp: number;
  totalXp: number;
  streak: number;
  multiplier: number;
  leveledUp: boolean;
  previousTier: RankTier;
  newTier: RankTier;
  newlyUnlockedBadges: Badge[];
};

export async function awardVerifiedXP({
  userId,
  baseXp,
  reason,
  subject,
  focusMinutes = 0,
  supabase,
  isSpacedRevision = false,
  isFlashcard = false,
  isMockTest = false,
}: AwardXPOptions): Promise<AwardXPResult> {
  const current = getGamificationData(userId);
  const previousTier = getRankTier(current.xp);

  const today = todayStr();
  const yesterday = yesterdayStr();

  let streak = current.streak;
  if (!current.lastActiveDate) {
    streak = 1;
  } else if (current.lastActiveDate === today) {
    // Already active today, streak count stays the same
    streak = Math.max(1, streak);
  } else if (current.lastActiveDate === yesterday) {
    // Continued streak from yesterday!
    streak = streak + 1;
  } else {
    // Gap day, streak resets to 1
    streak = 1;
  }

  const { multiplier } = getStreakMultiplier(streak);
  const finalAddedXp = Math.max(5, Math.round(baseXp * multiplier));
  const newTotalXp = current.xp + finalAddedXp;

  const newTier = getRankTier(newTotalXp);
  const leveledUp = newTier.id !== previousTier.id && newTier.minXp > previousTier.minXp;

  const subjectSessions = { ...current.subjectSessions };
  if (subject && focusMinutes > 0) {
    subjectSessions[subject] = (subjectSessions[subject] || 0) + 1;
  }

  const verifiedSessions = focusMinutes > 0 ? current.verifiedSessions + 1 : current.verifiedSessions;
  const verifiedMinutes = current.verifiedMinutes + focusMinutes;
  const revisionsCompleted = isSpacedRevision ? current.revisionsCompleted + 1 : current.revisionsCompleted;
  const flashcardsDrilled = isFlashcard ? current.flashcardsDrilled + 1 : current.flashcardsDrilled;
  const mockTestsLogged = isMockTest ? current.mockTestsLogged + 1 : current.mockTestsLogged;

  // Evaluate badges
  const currentUnlocked = new Set(current.unlockedBadgeIds);
  const newlyUnlockedBadges: Badge[] = [];

  const checkBadge = (id: string, condition: boolean) => {
    if (condition && !currentUnlocked.has(id)) {
      currentUnlocked.add(id);
      const b = ALL_BADGES.find(item => item.id === id);
      if (b) newlyUnlockedBadges.push(b);
    }
  };

  // Focus badges
  checkBadge("first_focus", verifiedSessions >= 1);
  checkBadge("focus_apprentice", verifiedSessions >= 5);
  checkBadge("deep_work_spartan", verifiedSessions >= 25);
  checkBadge("centurion_focus", verifiedSessions >= 100);

  // Streak badges
  checkBadge("streak_3", streak >= 3);
  checkBadge("streak_7", streak >= 7);
  checkBadge("streak_14", streak >= 14);
  checkBadge("streak_30", streak >= 30);

  // Subject badges
  checkBadge("acc_master", (subjectSessions["Accounting"] || 0) >= 5);
  checkBadge("law_master", (subjectSessions["Business Laws"] || 0) >= 5);
  checkBadge("qa_master", (subjectSessions["Quantitative Aptitude"] || 0) >= 5);
  checkBadge("eco_master", (subjectSessions["Business Economics"] || 0) >= 5);

  // Special timing badges
  if (focusMinutes > 0) {
    const currentHour = new Date().getHours();
    if (currentHour >= 23 || currentHour < 4) {
      checkBadge("night_owl", true);
    }
    if (currentHour >= 4 && currentHour < 7) {
      checkBadge("early_bird", true);
    }
  }

  // Milestones
  checkBadge("memory_ace", revisionsCompleted > 0 || flashcardsDrilled > 0);
  checkBadge("mock_warrior", mockTestsLogged > 0);

  // Tier badges
  checkBadge("tier_iron", newTotalXp >= 250);
  checkBadge("tier_bronze", newTotalXp >= 700);
  checkBadge("tier_silver", newTotalXp >= 1500);
  checkBadge("tier_gold", newTotalXp >= 3000);

  const updatedState: GamificationState = {
    xp: newTotalXp,
    streak,
    lastActiveDate: today,
    verifiedSessions,
    verifiedMinutes,
    unlockedBadgeIds: Array.from(currentUnlocked),
    subjectSessions,
    revisionsCompleted,
    flashcardsDrilled,
    mockTestsLogged,
  };

  saveGamificationData(userId, updatedState);

  // Background sync to Supabase if columns exist (handled gracefully with try-catch)
  if (supabase) {
    void (async () => {
      try {
        await supabase
          .from("profiles")
          .update({
            xp: newTotalXp,
            streak,
            rank_tier: newTier.name,
          })
          .eq("id", userId);
      } catch (err) {
        // Quietly catch if columns don't exist yet on remote Postgres schema
        console.warn("Supabase gamification sync gracefully bypassed:", err);
      }
    })();
  }

  // Notify UI via CustomEvents
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("ca-gamification-updated", {
        detail: { state: updatedState, addedXp: finalAddedXp, reason },
      })
    );

    window.dispatchEvent(
      new CustomEvent("ca-xp-toast", {
        detail: {
          addedXp: finalAddedXp,
          reason,
          multiplier,
          leveledUp,
          newTier,
          newlyUnlockedBadges,
        },
      })
    );
  }

  return {
    addedXp: finalAddedXp,
    totalXp: newTotalXp,
    streak,
    multiplier,
    leveledUp,
    previousTier,
    newTier,
    newlyUnlockedBadges,
  };
}

export type LeaderboardEntry = {
  id: string;
  name: string;
  xp: number;
  streak: number;
  tier: RankTier;
  verifiedHours: number;
  isCurrentUser?: boolean;
};

// Real users leaderboard without fake/seeded users
export function generateLeaderboard(
  currentUser: { id: string; name: string },
  userState: GamificationState
): LeaderboardEntry[] {
  const userTier = getRankTier(userState.xp);
  const userEntry: LeaderboardEntry = {
    id: currentUser.id,
    name: currentUser.name || "You",
    xp: userState.xp,
    streak: userState.streak,
    tier: userTier,
    verifiedHours: Math.round((userState.verifiedMinutes / 60) * 10) / 10,
    isCurrentUser: true,
  };

  return [userEntry];
}
