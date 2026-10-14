"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subjects, type Discussion, type Profile, type Reply } from "@/lib/types";
import type { Subject } from "@/lib/subjects";
import {
  validateContent,
  getFlaggedMessages,
  flagMessage,
  REPORT_REASONS,
  markItemDeletedByMod,
  isItemDeletedByMod,
} from "@/lib/moderation";

export default function Community({
  supabase,
  userId,
  profile,
  discussions,
  replies,
  refresh,
  isModerator = false,
}: {
  supabase: SupabaseClient;
  userId: string;
  profile: Profile;
  discussions: Discussion[];
  replies: Reply[];
  refresh: () => Promise<void>;
  isModerator?: boolean;
}) {
  const [subject, setSubject] = useState<Subject>("Accounting");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reportingItem, setReportingItem] = useState<{ id: string; author: string; text: string } | null>(null);
  const [reportReason, setReportReason] = useState<string>(REPORT_REASONS[0]);
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [modNotice, setModNotice] = useState("");
  const [mobileTab, setMobileTab] = useState<"browse" | "ask">("browse");

  useEffect(() => {
    const list = getFlaggedMessages();
    setFlaggedIds(new Set(list.map(item => item.id)));
  }, []);

  const post = discussions.find(item => item.id === active);

  function getAuthor(itemUserId: string, fallbackName: string): string {
    if (itemUserId === userId) return profile.display_name;
    return fallbackName;
  }

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const titleCheck = validateContent(title);
    if (!titleCheck.valid) {
      setError(`⚠️ Moderation warning (Title): ${titleCheck.reason}`);
      return;
    }
    const bodyCheck = validateContent(body);
    if (!bodyCheck.valid) {
      setError(`⚠️ Moderation warning (Details): ${bodyCheck.reason}`);
      return;
    }

    setBusy(true);
    const { error: insertError } = await supabase.from("discussions").insert({
      user_id: userId,
      author_name: profile.display_name,
      subject,
      title: title.trim(),
      body: body.trim(),
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setTitle("");
      setBody("");
      setMobileTab("browse");
      await refresh();
    }
    setBusy(false);
  }

  async function answer(event: React.FormEvent) {
    event.preventDefault();
    if (!post) return;
    setError("");

    const replyCheck = validateContent(reply);
    if (!replyCheck.valid) {
      setError(`⚠️ Moderation warning: ${replyCheck.reason}`);
      return;
    }

    setBusy(true);
    const { error: insertError } = await supabase.from("replies").insert({
      discussion_id: post.id,
      user_id: userId,
      author_name: profile.display_name,
      body: reply.trim(),
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setReply("");
      await refresh();
    }
    setBusy(false);
  }

  async function deleteDiscussion(discussionId: string) {
    if (!window.confirm("Are you sure you want to delete this discussion and all its replies?")) return;
    setError("");
    markItemDeletedByMod(discussionId);
    if (active === discussionId) setActive(null);
    try {
      const { error } = await supabase.from("discussions").delete().eq("id", discussionId);
      if (error) {
        console.warn("[Community] Delete discussion warning:", error);
      }
    } catch (err) {
      console.error("Failed to delete discussion:", err);
    }
    await refresh();
    setModNotice("Discussion deleted successfully.");
    setTimeout(() => setModNotice(""), 3500);
  }

  async function deleteReply(replyId: string) {
    if (!window.confirm("Delete this reply?")) return;
    setError("");
    markItemDeletedByMod(replyId);
    try {
      const { error } = await supabase.from("replies").delete().eq("id", replyId);
      if (error) {
        console.warn("[Community] Delete reply warning:", error);
      }
    } catch (err) {
      console.error("Failed to delete reply:", err);
    }
    await refresh();
    setModNotice("Reply deleted.");
    setTimeout(() => setModNotice(""), 3500);
  }

  function submitReport() {
    if (!reportingItem) return;
    flagMessage(reportingItem.id, reportReason);
    setFlaggedIds(prev => new Set([...prev, reportingItem.id]));
    setReportingItem(null);
    setModNotice("Report recorded. The content has been hidden from your view.");
    setTimeout(() => setModNotice(""), 4000);
  }

  function toggleReveal(id: string) {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">ASK · EXPLAIN · LEARN</p>
        <h1>Community discussions.</h1>
        <p>Get unstuck with help from people preparing for the same exam.</p>
      </header>

      {modNotice && <div className="notice success">{modNotice}</div>}

      {/* Mobile Tab Switcher */}
      <div className="community-mobile-tabs" role="tablist">
        <button
          type="button"
          className={mobileTab === "browse" ? "active" : ""}
          onClick={() => setMobileTab("browse")}
          role="tab"
          aria-selected={mobileTab === "browse"}
        >
          <span>💬</span> Browse discussions {discussions.length > 0 && `(${discussions.filter(d => !isItemDeletedByMod(d.id)).length})`}
        </button>
        <button
          type="button"
          className={mobileTab === "ask" ? "active" : ""}
          onClick={() => { setMobileTab("ask"); setActive(null); }}
          role="tab"
          aria-selected={mobileTab === "ask"}
        >
          <span>+</span> Ask a question
        </button>
      </div>

      <div className="two-columns">
        <section className={`card community-card-ask ${mobileTab !== "ask" ? "community-hide-on-mobile" : ""}`}>
          <div className="section-title">
            <div>
              <p className="eyebrow">START A DISCUSSION</p>
              <h3>Ask the community</h3>
            </div>
          </div>
          <form className="form-stack" onSubmit={create}>
            <label>
              Subject
              <select value={subject} onChange={event => setSubject(event.target.value as Subject)}>
                {subjects.map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input
                value={title}
                onChange={event => setTitle(event.target.value)}
                maxLength={120}
                placeholder="What are you trying to understand?"
                required
              />
            </label>
            <label>
              Details
              <textarea
                value={body}
                onChange={event => setBody(event.target.value)}
                maxLength={2000}
                rows={6}
                placeholder="Add context for a useful answer…"
                required
              />
            </label>
            <button className="primary" disabled={busy}>
              Post discussion
            </button>
            {error && <p className="notice error-text">{error}</p>}
          </form>
        </section>

        <section className={`card community-card-browse ${mobileTab !== "browse" ? "community-hide-on-mobile" : ""}`}>
          <div className="section-title">
            <div>
              <p className="eyebrow">OPEN CONVERSATIONS</p>
              <h3>{post ? post.title : "Latest discussions"}</h3>
            </div>
          </div>

          {post ? (
            <>
              <div className="discussion-top-bar">
                <button type="button" className="back" onClick={() => setActive(null)}>
                  ← All discussions
                </button>
                {(post.user_id === userId || isModerator) && (
                  <button
                    type="button"
                    className="danger-link"
                    onClick={() => void deleteDiscussion(post.id)}
                  >
                    {isModerator && post.user_id !== userId ? "🛡️ Moderator: Delete discussion" : "Delete discussion"}
                  </button>
                )}
              </div>

              <span className="tag">{post.subject}</span>
              <p className="post-body">{post.body}</p>
              <small className="fine">
                Asked by <strong>{getAuthor(post.user_id, post.author_name)}</strong>
                {post.user_id === userId && " (You)"} ·{" "}
                {new Date(post.created_at).toLocaleDateString("en-IN")}
              </small>

              <div className="reply-list">
                {replies
                  .filter(item => item.discussion_id === post.id && !isItemDeletedByMod(item.id))
                  .map(item => {
                    const author = getAuthor(item.user_id, item.author_name);
                    const isMine = item.user_id === userId;
                    const isFlagged = flaggedIds.has(item.id);
                    const isRevealed = revealedIds.has(item.id);

                    return (
                      <div className="reply" key={item.id}>
                        <div className="reply-head">
                          <strong>
                            {author} {isMine && <span className="author-you-badge">You</span>}
                          </strong>
                          <div className="message-actions">
                            {isMine ? (
                              <button
                                type="button"
                                className="msg-action-btn delete-btn"
                                onClick={() => void deleteReply(item.id)}
                                title="Delete your reply"
                              >
                                🗑️
                              </button>
                            ) : isModerator ? (
                              <button
                                type="button"
                                className="msg-action-btn delete-btn mod-delete-btn"
                                onClick={() => void deleteReply(item.id)}
                                title="Moderator: Delete reply"
                              >
                                🗑️
                              </button>
                            ) : null}
                            {!isMine && (
                              <button
                                type="button"
                                className="msg-action-btn report-btn"
                                onClick={() =>
                                  setReportingItem({
                                    id: item.id,
                                    author: item.author_name,
                                    text: item.body,
                                  })
                                }
                                title="Report reply"
                              >
                                🚩
                              </button>
                            )}
                          </div>
                        </div>

                        {isFlagged && !isRevealed ? (
                          <div className="msg-moderation-shield">
                            <span>⚠️ Reply hidden (Flagged)</span>
                            <button
                              type="button"
                              className="text-button shield-reveal-btn"
                              onClick={() => toggleReveal(item.id)}
                            >
                              Show
                            </button>
                          </div>
                        ) : (
                          <>
                            <p>{item.body}</p>
                            {isFlagged && (
                              <button
                                type="button"
                                className="text-button shield-hide-btn"
                                onClick={() => toggleReveal(item.id)}
                              >
                                Hide
                              </button>
                            )}
                          </>
                        )}
                        <small>{new Date(item.created_at).toLocaleString("en-IN")}</small>
                      </div>
                    );
                  })}
              </div>

              <form className="form-stack" onSubmit={answer}>
                <label>
                  Your answer
                  <textarea
                    value={reply}
                    onChange={event => setReply(event.target.value)}
                    maxLength={1200}
                    rows={4}
                    placeholder="Explain in your own words…"
                    required
                  />
                </label>
                <button className="primary" disabled={busy}>
                  Reply
                </button>
              </form>
            </>
          ) : discussions.filter(item => !isItemDeletedByMod(item.id)).length ? (
            discussions.filter(item => !isItemDeletedByMod(item.id)).map(item => (
              <div className="discussion-card-row" key={item.id}>
                <button
                  type="button"
                  className="discussion"
                  onClick={() => { setActive(item.id); setMobileTab("browse"); }}
                >
                  <span className="tag">{item.subject}</span>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                  <small>
                    {getAuthor(item.user_id, item.author_name)} ·{" "}
                    {replies.filter(r => r.discussion_id === item.id && !isItemDeletedByMod(r.id)).length} replies
                  </small>
                </button>
                {(item.user_id === userId || isModerator) && (
                  <button
                    type="button"
                    className="msg-action-btn delete-btn card-delete-btn"
                    onClick={e => {
                      e.stopPropagation();
                      void deleteDiscussion(item.id);
                    }}
                    title={isModerator && item.user_id !== userId ? "Moderator: Delete discussion" : "Delete discussion"}
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="empty">Be the first to start a discussion.</p>
          )}
        </section>
      </div>

      {/* Report Modal */}
      {reportingItem && (
        <div className="report-modal-overlay" onClick={() => setReportingItem(null)}>
          <div className="report-modal-card" onClick={e => e.stopPropagation()}>
            <div className="report-modal-head">
              <h3>Report Community Content</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setReportingItem(null)}
              >
                ✕
              </button>
            </div>
            <p className="fine">Help keep our study community respectful and productive.</p>
            <div className="reported-snippet">
              <strong>{reportingItem.author}:</strong>
              <p>“{reportingItem.text.slice(0, 150)}”</p>
            </div>
            <label className="report-reason-label">
              Reason:
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
                onClick={() => setReportingItem(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger-button"
                onClick={submitReport}
              >
                Submit report & hide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
