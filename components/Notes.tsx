"use client";

import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { subjects, type Note } from "@/lib/types";
import type { Subject } from "@/lib/subjects";
import { uploadStudyNote } from "@/lib/note-upload";

const BUCKET = "study-notes";
const PAGE_SIZE = 24;

export default function Notes({ supabase, userId }: { supabase: SupabaseClient; userId: string }) {
  const [subject, setSubject] = useState<Subject>("Accounting");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<"upload" | "write">("upload");
  const [shared, setShared] = useState(false);
  const [scope, setScope] = useState<"mine" | "shared">("shared");
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
        const rows = (data || []) as Note[];
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
    if (!window.confirm(`Delete “${note.title}”?`)) return;
    setListError("");
    if (note.file_path) {
      const { error } = await supabase.storage.from(BUCKET).remove([note.file_path]);
      if (error) { setListError(error.message); return; }
    }
    const { error } = await supabase.from("notes").delete().eq("id", note.id);
    if (error) setListError(error.message);
    else resetList();
  }

  return <>
    <header className="page-head"><p className="eyebrow">KNOWLEDGE BANK</p><h1>Notes worth sharing.</h1><p>Upload a PDF or Word document, or write a short note. Explore what other students have shared by subject.</p></header>
    <div className="two-columns">
      <section className="card">
        <div className="section-title"><div><p className="eyebrow">ADD TO YOUR LIBRARY</p><h3>New note</h3></div></div>
        <div className="segmented note-method"><button type="button" className={method === "upload" ? "active" : ""} onClick={() => setMethod("upload")}>Upload a file</button><button type="button" className={method === "write" ? "active" : ""} onClick={() => setMethod("write")}>Write a note</button></div>
        <form className="form-stack" onSubmit={save}>
          <label>Subject<select value={subject} onChange={event => setSubject(event.target.value as Subject)}>{subjects.map(item => <option key={item}>{item}</option>)}</select></label>
          <label>Title<input value={title} onChange={event => setTitle(event.target.value)} maxLength={120} required placeholder="e.g. Bank reconciliation summary" /></label>
          {method === "upload" ? <label className="file-picker">PDF or Word document<input ref={fileInput} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={event => setFile(event.target.files?.[0] || null)} required />{file && <small>{file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB</small>}<span>PDF, DOC or DOCX · up to 10 MB</span></label> : <label>Note<textarea value={content} onChange={event => setContent(event.target.value)} maxLength={5000} rows={7} required placeholder="Write the idea in your own words…" /></label>}
          <label className="check-label"><input type="checkbox" checked={shared} onChange={event => setShared(event.target.checked)} /> Share with other aspirants</label>
          <p className="fine">Only share notes you made or have permission to distribute. Private notes are visible only to you.</p>
          <button className="primary" disabled={busy}>{busy ? "Saving…" : method === "upload" ? "Upload note" : "Save note"}</button>
          {error && <p className="notice error-text" role="alert">{error}</p>}
        </form>
      </section>
      <section className="card">
        <div className="section-title"><div><p className="eyebrow">EXPLORE</p><h3>Browse notes</h3></div></div>
        <div className="segmented"><button type="button" className={scope === "shared" ? "active" : ""} onClick={() => { setScope("shared"); setItems([]); setPage(0); }}>Shared notes</button><button type="button" className={scope === "mine" ? "active" : ""} onClick={() => { setScope("mine"); setItems([]); setPage(0); }}>My notes</button></div>
        <label className="note-filter">Filter by subject<select value={subjectFilter} onChange={event => { setSubjectFilter(event.target.value as Subject | "All subjects"); setItems([]); setPage(0); }}><option>All subjects</option>{subjects.map(item => <option key={item}>{item}</option>)}</select></label>
        {listError && <p className="notice error-text" role="alert">{listError}</p>}
        <div className="note-list">{items.length ? items.map(item => <article className="note" key={item.id}><div className="note-heading"><span className="tag">{item.subject}</span>{item.file_name && <span className="file-type">{item.file_name.split(".").pop()?.toUpperCase()}</span>}</div><h4>{item.title}</h4>{item.content && <p>{item.content}</p>}{item.file_name && <div className="note-attachment"><span>▤</span><div><strong>{item.file_name}</strong><small>{item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB` : "Document"}</small></div><button type="button" className="text-button" onClick={() => void download(item)} disabled={downloading === item.id}>{downloading === item.id ? "Opening…" : "Download ↗"}</button></div>}<div className="note-meta"><small>{new Date(item.created_at).toLocaleDateString("en-IN")} {item.shared ? "· Shared" : "· Private"}</small>{item.user_id === userId && <button type="button" className="danger-link" onClick={() => void remove(item)}>Delete</button>}</div></article>) : !loading && <p className="empty">{scope === "mine" ? "You haven’t added a note for this subject yet." : "No shared notes for this subject yet. Be the first to contribute."}</p>}{loading && <p className="empty">Loading notes…</p>}</div>
        {hasMore && !loading && <button type="button" className="load-more" onClick={() => setPage(value => value + 1)}>Load more notes</button>}
      </section>
    </div>
  </>;
}
