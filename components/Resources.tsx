"use client";

import { useMemo, useState } from "react";
import { resources, type Resource } from "@/lib/resources";
import { subjects } from "@/lib/types";

export default function Resources() {
  const [kind, setKind] = useState<"All" | Resource["kind"]>("All");
  const [subject, setSubject] = useState("All"); const [search, setSearch] = useState("");
  const shown = useMemo(() => resources.filter(item => (kind === "All" || item.kind === kind) && (subject === "All" || item.subject === subject) && `${item.subject} ${item.attempt} ${item.kind}`.toLowerCase().includes(search.toLowerCase())), [kind, subject, search]);
  return <><header className="page-head"><p className="eyebrow">OFFICIAL ICAI LINKS</p><h1>Find the right paper.</h1><p>Question papers, MCQ keys, RTPs, model papers, and suggested answers in one place.</p></header><div className="resource-callout"><strong>About the “last 50 attempts” request</strong><p>ICAI&apos;s current Foundation archive lists eight attempts from June 2024 to September 2026, with different availability by subject. This library links to the verified official collections and does not invent missing papers or copy ICAI PDFs.</p></div><div className="resource-filters"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search attempt or subject" aria-label="Search resources" /><select value={kind} onChange={event => setKind(event.target.value as typeof kind)} aria-label="Resource type">{["All", "Question paper", "MCQ paper & key", "RTP", "MTP", "Suggested answer"].map(item => <option key={item}>{item}</option>)}</select><select value={subject} onChange={event => setSubject(event.target.value)} aria-label="Subject">{["All", ...subjects].map(item => <option key={item}>{item}</option>)}</select></div><p className="resource-total">{shown.length} matching official links</p><div className="resource-grid">{shown.map(item => <a className="resource" href={item.url} target="_blank" rel="noopener noreferrer" key={item.id}><span className="tag">{item.kind}</span><strong>{item.subject}</strong><small>{item.attempt}</small><p>{item.note}</p><em>Open on ICAI ↗</em></a>)}</div>{shown.length === 0 && <p className="empty">No resource matches these filters.</p>}</>;
}
