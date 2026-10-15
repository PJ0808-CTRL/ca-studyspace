"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import type { StudyLog } from "@/lib/types";

interface StudyHeatmapProps {
  logs: StudyLog[];
  className?: string;
}

interface DayData {
  dateStr: string;
  date: Date;
  minutes: number;
  sessionsCount: number;
  subjects: { [key: string]: number };
  level: 0 | 1 | 2 | 3 | 4;
}

export default function StudyHeatmap({ logs, className = "" }: StudyHeatmapProps) {
  const [range, setRange] = useState<"3m" | "6m" | "1y">("1y");
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group logs by ISO date "YYYY-MM-DD"
  const logsByDate = useMemo(() => {
    const map = new Map<string, { minutes: number; count: number; subjects: { [key: string]: number } }>();
    for (const log of logs) {
      if (!log.study_date) continue;
      const current = map.get(log.study_date) || { minutes: 0, count: 0, subjects: {} };
      current.minutes += log.minutes || 0;
      current.count += 1;
      if (log.subject) {
        current.subjects[log.subject] = (current.subjects[log.subject] || 0) + (log.minutes || 0);
      }
      map.set(log.study_date, current);
    }
    return map;
  }, [logs]);

  // Total active days, streaks, total hours
  const stats = useMemo(() => {
    let totalMinutes = 0;
    const activeDates = new Set<string>();

    for (const [dateStr, data] of logsByDate.entries()) {
      if (data.minutes > 0) {
        activeDates.add(dateStr);
        totalMinutes += data.minutes;
      }
    }

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toLocaleDateString("en-CA");

    let currentStreak = 0;
    const checkDate = new Date(today);
    if (!activeDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (activeDates.has(checkDate.toLocaleDateString("en-CA"))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate longest streak in past 365 days
    let longestStreak = 0;
    let tempStreak = 0;
    const scanDate = new Date(today);
    scanDate.setDate(scanDate.getDate() - 365);

    while (scanDate <= today) {
      const dStr = scanDate.toLocaleDateString("en-CA");
      if (activeDates.has(dStr)) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
      scanDate.setDate(scanDate.getDate() + 1);
    }

    return {
      activeDays: activeDates.size,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
    };
  }, [logsByDate]);

  // Generate grid weeks based on range
  const { weeks, monthLabels } = useMemo(() => {
    const numWeeks = range === "3m" ? 14 : range === "6m" ? 26 : 53;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // End on Saturday of the current week (or Sunday)
    const endOfWeek = new Date(today);
    const currentDayOfWeek = endOfWeek.getDay(); // 0 is Sunday, 6 is Saturday
    endOfWeek.setDate(endOfWeek.getDate() + (6 - currentDayOfWeek));

    // Start numWeeks before
    const startDate = new Date(endOfWeek);
    startDate.setDate(startDate.getDate() - numWeeks * 7 + 1);

    const generatedWeeks: DayData[][] = [];
    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    let weekCursor: DayData[] = [];
    const datePointer = new Date(startDate);

    let weekIndex = 0;
    while (datePointer <= endOfWeek) {
      const isoStr = datePointer.toLocaleDateString("en-CA");
      const logData = logsByDate.get(isoStr);
      const mins = logData ? logData.minutes : 0;

      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (mins >= 240) level = 4;
      else if (mins >= 120) level = 3;
      else if (mins >= 60) level = 2;
      else if (mins > 0) level = 1;

      const currentMonth = datePointer.getMonth();
      if (currentMonth !== lastMonth && datePointer.getDate() <= 14) {
        months.push({
          label: datePointer.toLocaleDateString("en-IN", { month: "short" }),
          weekIndex,
        });
        lastMonth = currentMonth;
      }

      weekCursor.push({
        dateStr: isoStr,
        date: new Date(datePointer),
        minutes: mins,
        sessionsCount: logData ? logData.count : 0,
        subjects: logData ? logData.subjects : {},
        level,
      });

      if (weekCursor.length === 7) {
        generatedWeeks.push(weekCursor);
        weekCursor = [];
        weekIndex++;
      }

      datePointer.setDate(datePointer.getDate() + 1);
    }

    if (weekCursor.length > 0) {
      generatedWeeks.push(weekCursor);
    }

    return { weeks: generatedWeeks, monthLabels: months };
  }, [range, logsByDate]);

  // Auto-scroll to the right on load / range change so user sees recent days first
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [range]);

  return (
    <div className={`card heatmap-card ${className}`}>
      {/* Header and Controls */}
      <div className="section-title heatmap-header">
        <div>
          <p className="eyebrow">CONSISTENCY RECORD · 365 DAYS</p>
          <div className="heatmap-title-row">
            <h3>Study activity heatmap</h3>
            <span className="heatmap-live-badge">Live Streak Engine</span>
          </div>
        </div>

        {/* Range Selector */}
        <div className="heatmap-range-selector">
          <button
            type="button"
            className={range === "3m" ? "active" : ""}
            onClick={() => setRange("3m")}
          >
            3 Months
          </button>
          <button
            type="button"
            className={range === "6m" ? "active" : ""}
            onClick={() => setRange("6m")}
          >
            6 Months
          </button>
          <button
            type="button"
            className={range === "1y" ? "active" : ""}
            onClick={() => setRange("1y")}
          >
            Full Year
          </button>
        </div>
      </div>

      {/* Quick Summary Metrics */}
      <div className="heatmap-metrics-bar">
        <div className="heatmap-metric">
          <span className="heatmap-metric-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
            </svg>
          </span>
          <div>
            <strong>{stats.currentStreak} {stats.currentStreak === 1 ? "day" : "days"}</strong>
            <small>Current Streak</small>
          </div>
        </div>
        <div className="heatmap-metric">
          <span className="heatmap-metric-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.45 1-1 1H8v4h8v-4h-1c-.55 0-1-.45-1-1v-2.34" />
              <path d="M6 4h12v7a6 6 0 0 1-12 0V4z" />
            </svg>
          </span>
          <div>
            <strong>{stats.longestStreak} {stats.longestStreak === 1 ? "day" : "days"}</strong>
            <small>Longest Streak</small>
          </div>
        </div>
        <div className="heatmap-metric">
          <span className="heatmap-metric-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <div>
            <strong>{stats.activeDays} days</strong>
            <small>Days Active</small>
          </div>
        </div>
        <div className="heatmap-metric">
          <span className="heatmap-metric-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </span>
          <div>
            <strong>{stats.totalHours} hrs</strong>
            <small>Total Study Time</small>
          </div>
        </div>
      </div>

      {/* Scrollable Heatmap Board */}
      <div className="heatmap-scroll-wrapper" ref={scrollContainerRef}>
        <div className="heatmap-board">
          {/* Month Labels Header */}
          <div className="heatmap-months-row">
            <div className="heatmap-weekday-spacer" />
            <div className="heatmap-months-track">
              {monthLabels.map((m, idx) => (
                <span
                  key={`${m.label}-${idx}`}
                  className="heatmap-month-label"
                  style={{ left: `${m.weekIndex * 15}px` }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          {/* Grid Layout: Weekday labels on Left, Weeks on Right */}
          <div className="heatmap-grid-area">
            {/* Weekday Labels (Mon, Wed, Fri) */}
            <div className="heatmap-weekdays">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="heatmap-weeks-track">
              {weeks.map((week, wIdx) => (
                <div key={`w-${wIdx}`} className="heatmap-week-col">
                  {week.map(day => {
                    const isSelected = selectedDay?.dateStr === day.dateStr;
                    const hoursFormatted = (day.minutes / 60).toFixed(1);
                    const tooltipText = day.minutes > 0
                      ? `${day.date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}: ${day.minutes}m (${hoursFormatted} hrs)`
                      : `${day.date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}: No study logged`;

                    return (
                      <button
                        key={day.dateStr}
                        type="button"
                        className={`heatmap-cell level-${day.level} ${isSelected ? "selected" : ""}`}
                        title={tooltipText}
                        onClick={() => setSelectedDay(day)}
                        aria-label={tooltipText}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Day Detail Popover / Callout */}
      {selectedDay && (
        <div className="heatmap-detail-banner">
          <div className="heatmap-detail-content">
            <div className="heatmap-detail-head">
              <strong>{selectedDay.date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>
              <span className={`heatmap-detail-badge level-${selectedDay.level}`}>
                {selectedDay.minutes > 0 ? `${selectedDay.minutes} minutes (${(selectedDay.minutes / 60).toFixed(1)} hrs)` : "Zero minutes logged"}
              </span>
            </div>
            {selectedDay.sessionsCount > 0 ? (
              <div className="heatmap-detail-breakdown">
                <small>{selectedDay.sessionsCount} {selectedDay.sessionsCount === 1 ? "session" : "sessions"} completed:</small>
                <div className="heatmap-subject-chips">
                  {Object.entries(selectedDay.subjects).map(([subj, mins]) => (
                    <span key={subj} className="heatmap-chip">
                      <strong>{subj}</strong>: {mins}m
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <p className="heatmap-detail-empty">No study sessions logged on this day. Open Pomodoro or log a session to light up this square!</p>
            )}
          </div>
          <button
            type="button"
            className="heatmap-detail-close"
            onClick={() => setSelectedDay(null)}
            title="Close details"
          >
            ✕
          </button>
        </div>
      )}

      {/* Footer Legend */}
      <div className="heatmap-footer">
        <span className="heatmap-scroll-hint">
          {range === "1y" ? "← Scroll horizontally to explore past months →" : "Consistent study turns light green into deep emerald"}
        </span>
        <div className="heatmap-legend">
          <span className="legend-text">Less</span>
          <span className="heatmap-cell level-0" title="0 mins" />
          <span className="heatmap-cell level-1" title="1 - 59 mins" />
          <span className="heatmap-cell level-2" title="60 - 119 mins" />
          <span className="heatmap-cell level-3" title="120 - 239 mins" />
          <span className="heatmap-cell level-4" title="240+ mins (4+ hrs)" />
          <span className="legend-text">More</span>
        </div>
      </div>
    </div>
  );
}
