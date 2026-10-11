export interface ContentValidationResult {
  valid: boolean;
  reason?: string;
}

// Common patterns of abuse, harassment, and spam
const BLOCKED_WORDS = [
  // Profanity & abuse
  "madarchod", "bhenchod", "bhosdike", "chutiya", "gandu", "harami", "kameena", "lauda", "lodu",
  "randi", "bhadwe", "saale kutte", "fuck", "bitch", "asshole", "bastard", "cunt", "motherfucker",
  "dickhead", "slut", "whore", "nigger", "retard",
  // Spam / scam keywords
  "telegram.me/", "t.me/", "whatsapp.com/channel", "wa.me/",
  "cheat exam", "leak paper", "paper leak", "hack exam", "buy question paper",
  "dm for paper", "guaranteed pass for money", "exam answers leak"
];

const REPEATED_CHAR_REGEX = /(.)\1{9,}/; // e.g. "aaaaaaaaaa"
const URL_COUNT_REGEX = /https?:\/\//gi;

export function validateContent(text: string): ContentValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { valid: false, reason: "Message cannot be empty." };
  }

  const lower = trimmed.toLowerCase();

  // Check blocked words / phrases
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return {
        valid: false,
        reason: "Message contains prohibited words, offensive language, or promotional spam.",
      };
    }
  }

  // Check excessive URLs (more than 2 links in a single message)
  const links = lower.match(URL_COUNT_REGEX);
  if (links && links.length > 2) {
    return {
      valid: false,
      reason: "Excessive links detected. Please avoid sending bulk links.",
    };
  }

  // Check excessive repeated characters (spam)
  if (REPEATED_CHAR_REGEX.test(lower)) {
    return {
      valid: false,
      reason: "Message contains excessive repeated characters.",
    };
  }

  // Check ALL CAPS yelling on long messages (> 35 characters)
  if (trimmed.length > 35) {
    const letters = trimmed.replace(/[^a-zA-Z]/g, "");
    if (letters.length > 20) {
      const upperCount = letters.replace(/[^A-Z]/g, "").length;
      if (upperCount / letters.length > 0.85) {
        return {
          valid: false,
          reason: "Please avoid typing in all caps. Keep discussions readable.",
        };
      }
    }
  }

  return { valid: true };
}

// Local storage storage keys for user moderation actions
const REPORTED_MESSAGES_KEY = "ca_studyspace_reported_messages";

export interface FlaggedMessageRecord {
  id: string;
  reason: string;
  reportedAt: string;
}

export function getFlaggedMessages(): FlaggedMessageRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(REPORTED_MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function flagMessage(id: string, reason: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getFlaggedMessages().filter(item => item.id !== id);
    existing.push({ id, reason, reportedAt: new Date().toISOString() });
    localStorage.setItem(REPORTED_MESSAGES_KEY, JSON.stringify(existing));
  } catch {
    // Ignore storage errors
  }
}

export function unflagMessage(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getFlaggedMessages().filter(item => item.id !== id);
    localStorage.setItem(REPORTED_MESSAGES_KEY, JSON.stringify(existing));
  } catch {
    // Ignore
  }
}

export function isMessageFlagged(id: string): boolean {
  return getFlaggedMessages().some(item => item.id === id);
}

export const REPORT_REASONS = [
  "Spam or unwanted advertising",
  "Abusive, vulgar, or offensive language",
  "Harassment, trolling, or hate speech",
  "Prohibited exam leaks or fraudulent claims",
  "Off-topic or disruptive content",
] as const;
