"use client";

import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subjects, type Note } from "@/lib/types";
import type { Subject } from "@/lib/subjects";
import { uploadStudyNote } from "@/lib/note-upload";
import { markItemDeletedByMod, isItemDeletedByMod } from "@/lib/moderation";

const BUCKET = "study-notes";
const PAGE_SIZE = 24;

export default function Notes({
  supabase,
  userId,
  isModerator = false,
}: {
  supabase: SupabaseClient;
  userId: string;
  isModerator?: boolean;
}) {
  const [subject, setSubject] = useState<Subject>("Accounting");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<"upload" | "write">("upload");
  const [shared, setShared] = useState(false);
  const [scope, setScope] = useState<"mine" | "shared">("mine");
  const [subjectFilter, setSubjectFilter] = useState<Subject | "All subjects">("All subjects");
  const [page, setPage] = useState(0);
  const [reload, setReload] = useState(0);
  const [items, setItems] = useState<Note[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [listError, setListError] = useState("");

  // Mobile tab switcher: defaults to "browse" so mobile users immediately see notes
  const [mobileTab, setMobileTab] = useState<"browse" | "create">("browse");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setListError("");
    let query = supabase.from("notes").select("*").order("created_at", { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    query = scope === "mine" ? query.eq("user_id", userId) : query.eq("shared", true);
    if (subjectFilter !== "All subjects") query = query.eq("subject", subjectFilter);
    query.then(({ data, error }) => {
      if (!active) return;
      if (error) setListError(error.message);
      else {
        const rows = ((data || []) as Note[]).filter(item => !isItemDeletedByMod(item.id));
        setItems(previous => page === 0 ? rows.slice(0, PAGE_SIZE) : [...previous, ...rows.slice(0, PAGE_SIZE)]);
        setHasMore(rows.length > PAGE_SIZE);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [supabase, userId, scope, subjectFilter, page, reload]);

  function resetList() { setItems([]); setPage(0); setReload(value => value + 1); }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) throw new Error("Add a title for your note.");
      if (method === "upload") {
        if (!file) throw new Error("Choose a PDF or Word file.");
        await uploadStudyNote({ supabase, userId, subject, title: trimmedTitle, file, shared });
        setFile(null);
        if (fileInput.current) fileInput.current.value = "";
      } else {
        const text = content.trim();
        if (!text) throw new Error("Write something in the note first.");
        const { error: insertError } = await supabase.from("notes").insert({ user_id: userId, subject, title: trimmedTitle, content: text, shared });
        if (insertError) throw insertError;
        setContent("");
      }
      setTitle("");
      setShared(false);
      setScope("mine");
      setSubjectFilter(subject);
      setMobileTab("browse");
      resetList();
    } catch (cause) { setError((cause as Error).message); }
    finally { setBusy(false); }
  }

  async function download(note: Note) {
    if (!note.file_path) return;
    setDownloading(note.id); setListError("");
    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(note.file_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = note.file_name || "study-note";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (cause) { setListError((cause as Error).message); }
    finally { setDownloading(null); }
  }

  async function remove(note: Note) {
    const isOwner = note.user_id === userId;
    const confirmMessage = isModerator && !isOwner
      ? `Moderator: Permanently delete shared note “${note.title}”?`
      : `Delete “${note.title}”?`;
    if (!window.confirm(confirmMessage)) return;
    setListError("");
    setBusy(true);

    try {
      // 1. First attempt deletion via server API route (if server admin key is configured)
      let deletedViaApi = false;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;
        const res = await fetch("/api/notes/delete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ noteId: note.id, filePath: note.file_path }),
        });
        if (res.ok) {
          deletedViaApi = true;
        }
      } catch {
        // Fall back to direct client deletion
      }

      // 2. If not deleted via server API, perform direct Supabase deletion
      if (!deletedViaApi) {
        if (note.file_path) {
          try {
            await supabase.storage.from(BUCKET).remove([note.file_path]);
          } catch {
            // Continue if storage permissions restrict cross-user storage removal
          }
        }
        const { error } = await supabase.from("notes").delete().eq("id", note.id);
        if (error) {
          throw error;
        }
      }

      // 3. Mark as locally deleted and synchronize list from database
      markItemDeletedByMod(note.id);
      setItems(previous => previous.filter(item => item.id !== note.id));
      resetList();
    } catch (cause) {
      const msg = (cause as Error).message || "Failed to delete note.";
      setListError(
        msg.includes("row-level security") || msg.includes("policy")
          ? "Database permission notice: Delete restricted by Supabase RLS. Run the SQL migration (20261014_fix_notes_and_moderation_deletion.sql) in your Supabase SQL editor to enable moderator deletion."
          : `Delete failed: ${msg}`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <p className="eyebrow">KNOWLEDGE BANK</p>
        <h1>Notes worth sharing.</h1>
        <p>Upload a PDF or Word document, or write a short note. Explore what other students have shared by subject.</p>
      </header>

      {/* Mobile view toggle: lets mobile users jump directly between browsing notes and adding new notes */}
      <div className="notes-mobile-tabs" role="tablist">
        <button
          type="button"
          className={mobileTab === "browse" ? "active" : ""}
          onClick={() => setMobileTab("browse")}
          role="tab"
          aria-selected={mobileTab === "browse"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 6 }}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          Browse notes {items.length > 0 && `(${items.length})`}
        </button>
        <button
          type="button"
          className={mobileTab === "create" ? "active" : ""}
          onClick={() => setMobileTab("create")}
          role="tab"
          aria-selected={mobileTab === "create"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 6 }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Upload / Write
        </button>
      </div>

      <div className="two-columns notes-two-columns">
        <section className={`card notes-card notes-card-create ${mobileTab !== "create" ? "notes-hide-on-mobile" : ""}`}>
          <div className="section-title">
            <div>
              <p className="eyebrow">ADD TO YOUR LIBRARY</p>
              <h3>New note</h3>
            </div>
          </div>
          <div className="segmented note-method">
            <button type="button" className={method === "upload" ? "active" : ""} onClick={() => setMethod("upload")}>
              Upload a file
            </button>
            <button type="button" className={method === "write" ? "active" : ""} onClick={() => setMethod("write")}>
              Write a note
            </button>
          </div>
          <form className="form-stack" onSubmit={save}>
            <label>
              Subject
              <select value={subject} onChange={event => setSubject(event.target.value as Subject)}>
                {subjects.map(item => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label>
              Title
              <input value={title} onChange={event => setTitle(event.target.value)} maxLength={120} required placeholder="e.g. Bank reconciliation summary" />
            </label>
            {method === "upload" ? (
              <label className="file-picker">
                PDF or Word document
                <input
                  ref={fileInput}
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={event => setFile(event.target.files?.[0] || null)}
                  required
                />
                {file && <small>{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</small>}
                <span>PDF, DOC or DOCX · up to 10 MB</span>
              </label>
            ) : (
              <label>
                Note
                <textarea value={content} onChange={event => setContent(event.target.value)} maxLength={5000} rows={7} required placeholder="Write the idea in your own words…" />
              </label>
            )}
            <label className="check-label">
              <input type="checkbox" checked={shared} onChange={event => setShared(event.target.checked)} /> Share with other aspirants
            </label>
            <p className="fine">Only share notes you made or have permission to distribute. Private notes are visible only to you.</p>
            <button className="primary" disabled={busy}>
              {busy ? "Saving…" : method === "upload" ? "Upload note" : "Save note"}
            </button>
            {error && <p className="notice error-text" role="alert">{error}</p>}
          </form>
        </section>

        <section className={`card notes-card notes-card-browse ${mobileTab !== "browse" ? "notes-hide-on-mobile" : ""}`}>
          <div className="section-title">
            <div>
              <p className="eyebrow">EXPLORE</p>
              <h3>Browse notes</h3>
            </div>
          </div>
          <div className="segmented">
            <button type="button" className={scope === "mine" ? "active" : ""} onClick={() => { setScope("mine"); setItems([]); setPage(0); }}>
              My notes
            </button>
            <button type="button" className={scope === "shared" ? "active" : ""} onClick={() => { setScope("shared"); setItems([]); setPage(0); }}>
              Shared notes
            </button>
          </div>
          <label className="note-filter">
            Filter by subject
            <select value={subjectFilter} onChange={event => { setSubjectFilter(event.target.value as Subject | "All subjects"); setItems([]); setPage(0); }}>
              <option>All subjects</option>
              {subjects.map(item => <option key={item}>{item}</option>)}
            </select>
          </label>
          {listError && <p className="notice error-text" role="alert">{listError}</p>}
          <div className="note-list">
            {items.filter(item => !isItemDeletedByMod(item.id)).length ? (
              items.filter(item => !isItemDeletedByMod(item.id)).map(item => (
                <article className="note" key={item.id}>
                  <div className="note-heading">
                    <span className="tag">{item.subject}</span>
                    {item.file_name && <span className="file-type">{item.file_name.split(".").pop()?.toUpperCase()}</span>}
                  </div>
                  <h4>{item.title}</h4>
                  {item.content && <p>{item.content}</p>}
                  {item.file_name && (
                    <div className="note-attachment">
                      <span className="note-file-icon" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </span>
                      <div className="note-attachment-info">
                        <strong>{item.file_name}</strong>
                        <small>{item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB` : "Document"}</small>
                      </div>
                      <button type="button" className="text-button" onClick={() => void download(item)} disabled={downloading === item.id}>
                        {downloading === item.id ? "Opening…" : "Download ↗"}
                      </button>
                    </div>
                  )}
                  <div className="note-meta">
                    <small>{new Date(item.created_at).toLocaleDateString("en-IN")} {item.shared ? "· Shared" : "· Private"}</small>
                    {(item.user_id === userId || isModerator) && (
                      <button
                        type="button"
                        className="danger-link"
                        onClick={() => void remove(item)}
                        title={isModerator && item.user_id !== userId ? "Moderator: Permanently delete note" : "Delete note"}
                      >
                        {isModerator && item.user_id !== userId ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Moderator: Delete
                          </span>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : !loading ? (
              <div className="notes-empty-state">
                <div className="notes-empty-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <b>{scope === "mine" ? "Your notes library is empty" : "No shared notes for this subject yet"}</b>
                <p>
                  {scope === "mine"
                    ? "Upload your revision PDFs, chapter summaries, or handwritten notes to keep them organized across all your devices."
                    : "Be the first aspirant to contribute notes for this subject and help fellow students."}
                </p>
                {scope === "mine" && (
                  <button
                    type="button"
                    className="primary notes-empty-cta"
                    onClick={() => setMobileTab("create")}
                  >
                    + Upload or write a note
                  </button>
                )}
              </div>
            ) : null}
            {loading && <p className="empty">Loading notes…</p>}
          </div>
          {hasMore && !loading && (
            <button type="button" className="load-more" onClick={() => setPage(value => value + 1)}>
              Load more notes
            </button>
          )}
        </section>
      </div>
    </>
  );
}
