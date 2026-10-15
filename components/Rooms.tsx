"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rooms, type Profile, type RoomMessage } from "@/lib/types";
import {
  validateContent,
  getFlaggedMessages,
  flagMessage,
  unflagMessage,
  markItemDeletedByMod,
  isItemDeletedByMod,
  REPORT_REASONS,
} from "@/lib/moderation";

export default function Rooms({
  supabase,
  userId,
  profile,
  isModerator = false,
}: {
  supabase: SupabaseClient;
  userId: string;
  profile: Profile;
  isModerator?: boolean;
}) {
  const [room, setRoom] = useState("General");
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("Connecting…");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Moderation state - persist so if moderator navigates to other tabs, it stays enabled
  const [modMode, setModMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ca_studyspace_room_mod_mode");
      if (saved !== null) return saved === "true";
    }
    return isModerator;
  });

  const toggleModMode = () => {
    setModMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem("ca_studyspace_room_mod_mode", String(next));
      } catch {}
      return next;
    });
  };

  const [showGuidelines, setShowGuidelines] = useState(false);
  const [reportingMessage, setReportingMessage] = useState<RoomMessage | null>(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [modNotice, setModNotice] = useState("");

  // Dynamic user name cache to ensure latest names across all chat items
  const [nameCache, setNameCache] = useState<Record<string, string>>({});

  // Sync flagged message IDs from localStorage on mount
  useEffect(() => {
    const records = getFlaggedMessages();
    setFlaggedIds(new Set(records.map(r => r.id)));
  }, []);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("room_messages")
      .select("*")
      .eq("room", room)
      .order("created_at", { ascending: false })
      .limit(80);

    if (error) {
      setError(error.message);
    } else {
      const list = ((data || []).reverse() as RoomMessage[]).filter(
        item => !isItemDeletedByMod(item.id)
      );
      setMessages(list);
      setError("");

      // Update name cache from fetched messages
      setNameCache(prev => {
        const next = { ...prev };
        for (const m of list) {
          next[m.user_id] = m.author_name;
        }
        next[userId] = profile.display_name;
        return next;
      });
    }
  }, [supabase, room, userId, profile.display_name]);

  useEffect(() => {
    let active = true;
    void load();

    // Subscribe to INSERT, UPDATE, DELETE, and broadcast for live synchronization
    const channel = supabase.channel(`room:${room}`);
    channelRef.current = channel;

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_messages", filter: `room=eq.${room}` },
        payload => {
          if (!active) return;
          const msg = payload.new as RoomMessage;
          if (isItemDeletedByMod(msg.id)) return;
          setMessages(current =>
            current.some(item => item.id === msg.id) ? current : [...current, msg].slice(-80)
          );
          setNameCache(prev => ({
            ...prev,
            [msg.user_id]: msg.author_name,
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "room_messages", filter: `room=eq.${room}` },
        payload => {
          if (!active) return;
          const updated = payload.new as RoomMessage;
          if (isItemDeletedByMod(updated.id)) return;
          setMessages(current =>
            current.map(item => (item.id === updated.id ? updated : item))
          );
          setNameCache(prev => ({
            ...prev,
            [updated.user_id]: updated.author_name,
          }));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "room_messages", filter: `room=eq.${room}` },
        payload => {
          if (!active) return;
          const deleted = payload.old as { id: string };
          if (deleted?.id) {
            markItemDeletedByMod(deleted.id);
            setMessages(current => current.filter(item => item.id !== deleted.id));
          }
        }
      )
      .on(
        "broadcast",
        { event: "mod_delete" },
        payload => {
          if (!active) return;
          const deletedId = (payload?.payload as { id: string })?.id;
          if (deletedId) {
            markItemDeletedByMod(deletedId);
            setMessages(current => current.filter(item => item.id !== deletedId));
          }
        }
      )
      .subscribe(state => {
        if (active) {
          setStatus(
            state === "SUBSCRIBED"
              ? "Live"
              : state === "CHANNEL_ERROR"
              ? "Connection issue"
              : "Connecting…"
          );
        }
      });

    return () => {
      active = false;
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [supabase, room, load]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Resolve display name: current user ALWAYS gets profile.display_name; others get cached or stored
  function getAuthorName(msg: RoomMessage): string {
    if (msg.user_id === userId) {
      return profile.display_name;
    }
    return nameCache[msg.user_id] || msg.author_name;
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    // Content moderation validation
    const check = validateContent(text);
    if (!check.valid) {
      setError(`⚠️ Moderation notice: ${check.reason}`);
      return;
    }

    setBusy(true);
    setError("");

    const { data, error } = await supabase
      .from("room_messages")
      .insert({
        user_id: userId,
        room,
        author_name: profile.display_name,
        body: text,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
      setDraft("");
      setMessages(current =>
        current.some(item => item.id === data.id)
          ? current
          : [...current, data as RoomMessage].slice(-80)
      );
    }
    setBusy(false);
  }

  async function deleteMessage(msgId: string) {
    if (!window.confirm("Remove this message from the study room?")) return;
    setError("");

    // 1. Immediately mark deleted in persistent moderator storage so it NEVER reloads
    markItemDeletedByMod(msgId);

    // 2. Remove immediately from current state
    setMessages(current => current.filter(m => m.id !== msgId));

    // 3. Broadcast to all active students in the room so it disappears live on their screens
    try {
      void channelRef.current?.send({
        type: "broadcast",
        event: "mod_delete",
        payload: { id: msgId },
      });
    } catch {}

    // 4. Send delete query to Supabase database
    try {
      await supabase.from("room_messages").delete().eq("id", msgId);
    } catch {}

    setModNotice("Message was deleted.");
    setTimeout(() => setModNotice(""), 3500);
  }

  function handleOpenReport(msg: RoomMessage) {
    setReportingMessage(msg);
    setReportReason(REPORT_REASONS[0]);
  }

  function submitReport() {
    if (!reportingMessage) return;
    flagMessage(reportingMessage.id, reportReason);
    setFlaggedIds(prev => new Set([...prev, reportingMessage.id]));
    setReportingMessage(null);
    setModNotice("Message has been reported and hidden from your feed.");
    setTimeout(() => setModNotice(""), 4000);
  }

  function toggleReveal(msgId: string) {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  }

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">STUDY TOGETHER</p>
        <h1>Live study rooms.</h1>
        <p>Ask questions and work through topics with other aspirants in real time.</p>
      </header>

      <div className="room-shell">
        <aside className="room-menu">
          <span>YOUR ROOMS</span>
          {rooms.map(item => (
            <button
              key={item}
              className={item === room ? "active" : ""}
              onClick={() => {
                setRoom(item);
                setMessages([]);
                setStatus("Connecting…");
              }}
            >
              # &nbsp;{item}
            </button>
          ))}
        </aside>

        <section className="room-main">
          <div className="room-head">
            <div>
              <h2># {room}</h2>
              <p>Share explanations in your own words.</p>
            </div>
            <div className="room-head-actions">
              {isModerator && (
                <button
                  type="button"
                  className={`room-mod-pill ${modMode ? "active" : ""}`}
                  onClick={toggleModMode}
                  title="Toggle moderator controls"
                >
                  <span>🛡️</span> {modMode ? "Moderation: ON" : "Moderation"}
                </button>
              )}
              <button
                type="button"
                className="room-rules-pill"
                onClick={() => setShowGuidelines(true)}
                title="View room rules & guidelines"
              >
                <span>ℹ️</span> Guidelines
              </button>
              <div className={`live-pill ${status === "Live" ? "on" : ""}`}>
                <i />
                {status}
              </div>
            </div>
          </div>

          {modNotice && <div className="notice success chat-mod-banner">{modNotice}</div>}

          <div className="message-list">
            {messages.filter(m => !isItemDeletedByMod(m.id)).length ? (
              messages
                .filter(m => !isItemDeletedByMod(m.id))
                .map(message => {
                const author = getAuthorName(message);
                const isMine = message.user_id === userId;
                const isFlagged = flaggedIds.has(message.id);
                const isRevealed = revealedIds.has(message.id);

                return (
                  <div
                    className={`message ${isMine ? "mine" : ""} ${isFlagged ? "is-flagged" : ""}`}
                    key={message.id}
                  >
                    <span className="message-avatar">{author.slice(0, 1).toUpperCase()}</span>
                    <div className="message-content-box">
                      <div className="message-header-line">
                        <strong>
                          {author}
                          {isMine && <span className="author-you-badge">You</span>}
                          <small>
                            {new Date(message.created_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </strong>

                        <div className="message-actions">
                          {isMine ? (
                            <button
                              type="button"
                              className="msg-action-btn delete-btn"
                              onClick={() => void deleteMessage(message.id)}
                              title="Delete your message"
                            >
                              🗑️
                            </button>
                          ) : isModerator && modMode ? (
                            <button
                              type="button"
                              className="msg-action-btn delete-btn mod-purge-btn"
                              onClick={() => void deleteMessage(message.id)}
                              title="Moderator: Delete message"
                            >
                              🗑️
                            </button>
                          ) : null}
                          {!isMine && (
                            <button
                              type="button"
                              className="msg-action-btn report-btn"
                              onClick={() => handleOpenReport(message)}
                              title="Report inappropriate message"
                            >
                              🚩
                            </button>
                          )}
                        </div>
                      </div>

                      {isFlagged && !isRevealed ? (
                        <div className="msg-moderation-shield">
                          <span>⚠️ Message hidden (Flagged as inappropriate)</span>
                          <button
                            type="button"
                            className="text-button shield-reveal-btn"
                            onClick={() => toggleReveal(message.id)}
                          >
                            View message
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className={isFlagged ? "revealed-text" : ""}>{message.body}</p>
                          {isFlagged && (
                            <button
                              type="button"
                              className="text-button shield-hide-btn"
                              onClick={() => toggleReveal(message.id)}
                            >
                              Hide flagged message
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="room-empty">
                <b>Start the conversation.</b>
                <p>A question or a study tip is enough.</p>
              </div>
            )}
            <div ref={bottom} />
          </div>

          {error && <div className="notice error-text chat-error-alert">{error}</div>}

          <form className="message-form" onSubmit={send}>
            <input
              value={draft}
              onChange={event => setDraft(event.target.value)}
              maxLength={700}
              placeholder={`Message #${room}`}
              aria-label="Message"
              required
            />
            <button className="primary" disabled={busy || !draft.trim()}>
              Send →
            </button>
          </form>
        </section>
      </div>

      {/* Flag / Report Dialog Modal */}
      {reportingMessage && (
        <div className="report-modal-overlay" onClick={() => setReportingMessage(null)}>
          <div className="report-modal-card" onClick={e => e.stopPropagation()}>
            <div className="report-modal-head">
              <h3>Report Message</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setReportingMessage(null)}
              >
                ✕
              </button>
            </div>
            <p className="fine">
              Help keep CA Orbit a safe and constructive study environment.
            </p>
            <div className="reported-snippet">
              <strong>{reportingMessage.author_name}:</strong>
              <p>“{reportingMessage.body.slice(0, 150)}{reportingMessage.body.length > 150 ? "…" : ""}”</p>
            </div>
            <label className="report-reason-label">
              Reason for reporting:
              <select
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
              >
                {REPORT_REASONS.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>
            <div className="report-modal-actions">
              <button
                type="button"
                className="back"
                onClick={() => setReportingMessage(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={submitReport}
              >
                Submit report & hide message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Conduct Guidelines Modal */}
      {showGuidelines && (
        <div className="report-modal-overlay" onClick={() => setShowGuidelines(false)}>
          <div className="report-modal-card" onClick={e => e.stopPropagation()}>
            <div className="report-modal-head">
              <h3>Room Conduct & Moderation Guidelines</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowGuidelines(false)}
              >
                ✕
              </button>
            </div>
            <div className="guidelines-body">
              <div className="guide-point">
                <strong>1. Mutual Respect</strong>
                <p>Treat all fellow aspirants with dignity. Disagreements on questions must be polite and focused on the concept.</p>
              </div>
              <div className="guide-point">
                <strong>2. Zero Tolerance for Abuse & Harassment</strong>
                <p>Vulgarity, slurs, toxic language, and personal attacks are automatically flagged and removed.</p>
              </div>
              <div className="guide-point">
                <strong>3. No Spam or Promotions</strong>
                <p>Do not post commercial advertisements, coaching links, WhatsApp/Telegram groups, or unrelated promotions.</p>
              </div>
              <div className="guide-point">
                <strong>4. Academic Integrity</strong>
                <p>Never request or share unauthorized paper leaks, proxy exam solicitations, or fraudulent material.</p>
              </div>
              <div className="guide-point">
                <strong>5. Community Moderation</strong>
                <p>Use the flag button (🚩) to report offensive messages. Authors can delete their messages anytime, and moderators keep rooms productive.</p>
              </div>
            </div>
            <button
              type="button"
              className="primary"
              style={{ width: "100%", marginTop: 16 }}
              onClick={() => setShowGuidelines(false)}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </>
  );
}
