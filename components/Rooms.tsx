"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { rooms, type Profile, type RoomMessage } from "@/lib/types";

export default function Rooms({ supabase, userId, profile }: { supabase: SupabaseClient; userId: string; profile: Profile }) {
  const [room, setRoom] = useState("General");
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("Connecting…");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("room_messages").select("*").eq("room", room).order("created_at", { ascending: false }).limit(80);
    if (error) setError(error.message);
    else { setMessages((data || []).reverse() as RoomMessage[]); setError(""); }
  }, [supabase, room]);

  useEffect(() => {
    let active = true;
    void load();
    const channel = supabase.channel(`room:${room}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "room_messages", filter: `room=eq.${room}` }, payload => {
        if (!active) return;
        const message = payload.new as RoomMessage;
        setMessages(current => current.some(item => item.id === message.id) ? current : [...current, message].slice(-80));
      })
      .subscribe(state => { if (active) setStatus(state === "SUBSCRIBED" ? "Live" : state === "CHANNEL_ERROR" ? "Connection issue" : "Connecting…"); });
    return () => { active = false; void supabase.removeChannel(channel); };
  }, [supabase, room, load]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault(); if (!draft.trim()) return;
    setBusy(true); setError("");
    const text = draft.trim();
    const { data, error } = await supabase.from("room_messages").insert({ user_id: userId, room, author_name: profile.display_name, body: text }).select().single();
    if (error) setError(error.message);
    else { setDraft(""); setMessages(current => current.some(item => item.id === data.id) ? current : [...current, data as RoomMessage].slice(-80)); }
    setBusy(false);
  }

  return <><header className="page-head"><p className="eyebrow">STUDY TOGETHER</p><h1>Live study rooms.</h1><p>Ask questions and work through topics with other aspirants in real time.</p></header><div className="room-shell"><aside className="room-menu"><span>YOUR ROOMS</span>{rooms.map(item => <button key={item} className={item === room ? "active" : ""} onClick={() => { setRoom(item); setMessages([]); setStatus("Connecting…"); }}># &nbsp;{item}</button>)}</aside><section className="room-main"><div className="room-head"><div><h2># {room}</h2><p>Share explanations in your own words.</p></div><div className={`live-pill ${status === "Live" ? "on" : ""}`}><i />{status}</div></div><div className="message-list">{messages.length ? messages.map(message => <div className={`message ${message.user_id === userId ? "mine" : ""}`} key={message.id}><span className="message-avatar">{message.author_name.slice(0, 1).toUpperCase()}</span><div><strong>{message.author_name} <small>{new Date(message.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</small></strong><p>{message.body}</p></div></div>) : <div className="room-empty"><b>Start the conversation.</b><p>A question or a study tip is enough.</p></div>}<div ref={bottom} /></div>{error && <div className="error-text">{error}</div>}<form className="message-form" onSubmit={send}><input value={draft} onChange={event => setDraft(event.target.value)} maxLength={700} placeholder={`Message #${room}`} aria-label="Message" required /><button className="primary" disabled={busy || !draft.trim()}>Send →</button></form></section></div></>;
}
