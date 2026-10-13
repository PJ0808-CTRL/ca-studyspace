"use client";

import React from "react";
import type { TierId } from "@/lib/gamification";

type RankEmblemProps = {
  tier: TierId | string;
  size?: number;
  animated?: boolean;
  className?: string;
  showGlow?: boolean;
};

export default function RankEmblem({
  tier,
  size = 32,
  animated = true,
  className = "",
  showGlow = false,
}: RankEmblemProps) {
  const normTier = (tier || "plastic").toLowerCase() as TierId;

  // SVG configurations for each tier
  switch (normTier) {
    case "iron":
      return (
        <span
          className={`rank-emblem emblem-iron ${animated ? "animated" : ""} ${className}`}
          style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="iron-metal-grad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#94A3B8" />
                <stop offset="0.45" stopColor="#475569" />
                <stop offset="0.8" stopColor="#334155" />
                <stop offset="1" stopColor="#1E293B" />
              </linearGradient>
              <linearGradient id="iron-bevel" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E2E8F0" stopOpacity="0.8" />
                <stop offset="1" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            <polygon points="24,3 43,14 43,34 24,45 5,34 5,14" fill="url(#iron-metal-grad)" stroke="url(#iron-bevel)" strokeWidth="2.5" />
            <polygon points="24,9 37,17 37,31 24,39 11,31 11,17" fill="#1E293B" opacity="0.6" stroke="#94A3B8" strokeWidth="1.2" />
            <path d="M24 13L32 24L24 35L16 24Z" fill="url(#iron-metal-grad)" stroke="#E2E8F0" strokeWidth="1.2" />
            <circle cx="24" cy="24" r="2.5" fill="#E2E8F0" />
          </svg>
        </span>
      );

    case "bronze":
      return (
        <span
          className={`rank-emblem emblem-bronze ${animated ? "animated" : ""} ${className}`}
          style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bronze-shield" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F59E0B" />
                <stop offset="0.3" stopColor="#D97706" />
                <stop offset="0.7" stopColor="#B45309" />
                <stop offset="1" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="bronze-highlight" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF3C7" stopOpacity="0.8" />
                <stop offset="1" stopColor="#451A03" />
              </linearGradient>
            </defs>
            <path d="M24 3C36 3 43 9 43 21C43 33 34 41 24 45C14 41 5 33 5 21C5 9 12 3 24 3Z" fill="url(#bronze-shield)" stroke="url(#bronze-highlight)" strokeWidth="2" />
            <path d="M24 8C33 8 38 13 38 22C38 31 31 37 24 40C17 37 10 31 10 22C10 13 15 8 24 8Z" fill="#78350F" opacity="0.45" stroke="#F59E0B" strokeWidth="1.2" />
            <polygon points="24,14 27.5,21.5 35.5,22.5 29.5,28 31.5,36 24,31.5 16.5,36 18.5,28 12.5,22.5 20.5,21.5" fill="url(#bronze-shield)" stroke="#FEF3C7" strokeWidth="1" />
          </svg>
        </span>
      );

    case "silver":
      return (
        <span
          className={`rank-emblem emblem-silver ${animated ? "animated" : ""} ${className}`}
          style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="silver-metal" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="0.25" stopColor="#E2E8F0" />
                <stop offset="0.6" stopColor="#94A3B8" />
                <stop offset="1" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="silver-wing" x1="4" y1="12" x2="44" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F8FAFC" />
                <stop offset="1" stopColor="#64748B" />
              </linearGradient>
            </defs>
            <path d="M4 18L14 14L18 24L10 26L4 18Z" fill="url(#silver-wing)" />
            <path d="M44 18L34 14L30 24L38 26L44 18Z" fill="url(#silver-wing)" />
            <polygon points="24,4 37,13 37,35 24,44 11,35 11,13" fill="url(#silver-metal)" stroke="#F8FAFC" strokeWidth="2" />
            <polygon points="24,10 32,16 32,32 24,38 16,32 16,16" fill="#1E293B" opacity="0.4" stroke="#E2E8F0" strokeWidth="1" />
            <path d="M24 13L27 21L35 24L27 27L24 35L21 27L13 24L21 21Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="0.8" />
          </svg>
        </span>
      );

    case "gold":
      return (
        <span
          className={`rank-emblem emblem-gold ${animated ? "animated" : ""} ${className}`}
          style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gold-core" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF08A" />
                <stop offset="0.3" stopColor="#FBBF24" />
                <stop offset="0.7" stopColor="#D97706" />
                <stop offset="1" stopColor="#78350F" />
              </linearGradient>
              <linearGradient id="gold-shimmer" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFBEB" />
                <stop offset="1" stopColor="#B45309" />
              </linearGradient>
            </defs>
            <path d="M6 14L16 11L18 23L8 24L6 14Z" fill="url(#gold-core)" opacity="0.9" />
            <path d="M42 14L32 11L30 23L40 24L42 14Z" fill="url(#gold-core)" opacity="0.9" />
            <polygon points="24,2 40,11 36,36 24,46 12,36 8,11" fill="url(#gold-core)" stroke="url(#gold-shimmer)" strokeWidth="2.2" />
            <polygon points="24,7 34,14 31,33 24,40 17,33 14,14" fill="#78350F" opacity="0.35" stroke="#FEF08A" strokeWidth="1" />
            {/* Crown Motif */}
            <path d="M17 26L20 18L24 23L28 18L31 26L28 29H20L17 26Z" fill="#FFFBEB" stroke="#B45309" strokeWidth="1" />
            <circle cx="24" cy="27" r="1.5" fill="#B45309" />
          </svg>
        </span>
      );

    case "platinum":
      return (
        <span
          className={`rank-emblem emblem-platinum ${animated ? "animated" : ""} ${className}`}
          style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="plat-cyan" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E0F2FE" />
                <stop offset="0.35" stopColor="#38BDF8" />
                <stop offset="0.75" stopColor="#0284C7" />
                <stop offset="1" stopColor="#075985" />
              </linearGradient>
              <linearGradient id="plat-accent" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F0F9FF" />
                <stop offset="1" stopColor="#0369A1" />
              </linearGradient>
            </defs>
            <polygon points="24,2 45,13 45,35 24,46 3,35 3,13" fill="url(#plat-cyan)" stroke="url(#plat-accent)" strokeWidth="2" />
            <polygon points="24,7 39,16 39,32 24,41 9,32 9,16" fill="#0C4A6E" opacity="0.6" stroke="#BAE6FD" strokeWidth="1" />
            {/* Prismatic Center */}
            <polygon points="24,12 34,24 24,36 14,24" fill="url(#plat-cyan)" stroke="#E0F2FE" strokeWidth="1.5" />
            <circle cx="24" cy="24" r="3" fill="#FFFFFF" />
          </svg>
        </span>
      );

    case "diamond":
      return (
        <span
          className={`rank-emblem emblem-diamond ${animated ? "animated" : ""} ${className}`}
          style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="dia-violet" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F5D0FE" />
                <stop offset="0.3" stopColor="#C084FC" />
                <stop offset="0.7" stopColor="#7E22CE" />
                <stop offset="1" stopColor="#3B0764" />
              </linearGradient>
              <linearGradient id="dia-sparkle" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FAF5FF" />
                <stop offset="1" stopColor="#581C87" />
              </linearGradient>
            </defs>
            <polygon points="24,2 45,15 37,44 11,44 3,15" fill="url(#dia-violet)" stroke="url(#dia-sparkle)" strokeWidth="2.2" />
            <polygon points="24,7 39,18 33,39 15,39 9,18" fill="#2E1065" opacity="0.55" stroke="#E9D5FF" strokeWidth="1" />
            {/* Gemstone Facet Cuts */}
            <polygon points="24,11 32,20 24,35 16,20" fill="url(#dia-violet)" stroke="#FAF5FF" strokeWidth="1.2" />
            <line x1="24" y1="11" x2="24" y2="35" stroke="#FFFFFF" strokeWidth="1.2" />
            <line x1="16" y1="20" x2="32" y2="20" stroke="#FFFFFF" strokeWidth="1.2" />
          </svg>
        </span>
      );

    case "master":
      return (
        <span
          className={`rank-emblem emblem-master ${animated ? "animated" : ""} ${className}`}
          style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="mast-crimson" x1="4" y1="2" x2="44" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FECDD3" />
                <stop offset="0.25" stopColor="#F43F5E" />
                <stop offset="0.7" stopColor="#BE123C" />
                <stop offset="1" stopColor="#4C0519" />
              </linearGradient>
              <linearGradient id="mast-wings" x1="2" y1="10" x2="46" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDA4AF" />
                <stop offset="1" stopColor="#881337" />
              </linearGradient>
            </defs>
            <path d="M4 14L16 10L18 24L8 26L4 14Z" fill="url(#mast-wings)" />
            <path d="M44 14L32 10L30 24L40 26L44 14Z" fill="url(#mast-wings)" />
            <polygon points="24,2 41,12 37,38 24,46 11,38 7,12" fill="url(#mast-crimson)" stroke="#FFE4E6" strokeWidth="2.2" />
            <polygon points="24,7 35,16 32,34 24,40 16,34 13,16" fill="#4C0519" opacity="0.6" stroke="#FDA4AF" strokeWidth="1" />
            {/* Dragon / Crown Sigil */}
            <path d="M24 13L28 19L33 17L30 25L24 22L18 25L15 17L20 19Z" fill="#FFF1F2" stroke="#881337" strokeWidth="0.8" />
            <circle cx="24" cy="28" r="2.5" fill="#FFE4E6" />
          </svg>
        </span>
      );

    case "grandmaster":
      return (
        <span
          className={`rank-emblem emblem-grandmaster ${animated ? "animated" : ""} ${className}`}
          style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gm-cosmic" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE047" />
                <stop offset="0.3" stopColor="#EC4899" />
                <stop offset="0.7" stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
              <radialGradient id="gm-core-glow" cx="24" cy="24" r="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDF4FF" />
                <stop offset="0.4" stopColor="#E879F9" stopOpacity="0.8" />
                <stop offset="1" stopColor="#4C1D95" stopOpacity="0.1" />
              </radialGradient>
            </defs>
            {/* Outer Orbit Rings */}
            <circle cx="24" cy="24" r="21" stroke="url(#gm-cosmic)" strokeWidth="1.8" strokeDasharray="6 3" opacity="0.8" />
            {/* Core Apex Star Crest */}
            <polygon points="24,2 42,12 42,36 24,46 6,36 6,12" fill="url(#gm-cosmic)" stroke="#FFFFFF" strokeWidth="2" />
            <polygon points="24,7 36,15 36,33 24,41 12,33 12,15" fill="url(#gm-core-glow)" stroke="#FDE047" strokeWidth="1" />
            {/* Central AIR Nova Star */}
            <path d="M24 10L27 19L36 22L28 26L29 35L24 30L19 35L20 26L12 22L21 19Z" fill="#FFFFFF" stroke="#FDE047" strokeWidth="1" />
          </svg>
        </span>
      );

    case "plastic":
    default:
      return (
        <span
          className={`rank-emblem emblem-plastic ${animated ? "animated" : ""} ${className}`}
          style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="plastic-slate" x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
                <stop stopColor="#CBD5E1" />
                <stop offset="0.5" stopColor="#64748B" />
                <stop offset="1" stopColor="#334155" />
              </linearGradient>
            </defs>
            <polygon points="24,4 41,14 41,34 24,44 7,34 7,14" fill="url(#plastic-slate)" stroke="#94A3B8" strokeWidth="2" />
            <polygon points="24,10 35,17 35,31 24,38 13,31 13,17" fill="#1E293B" opacity="0.5" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M24 16L30 24L24 32L18 24Z" fill="#CBD5E1" opacity="0.8" />
          </svg>
        </span>
      );
  }
}
