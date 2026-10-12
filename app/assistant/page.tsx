"use client";
import React from "react";
import { useApp } from "@/lib/store";
import { AppShell } from "@/components/shell";
import { ChatThinking } from "@/components/loading";
import { Send, Bot, Plus, Trash2, MessageSquare } from "lucide-react";

export default function AssistantPage() {
  const { profile, jobs, chat, pushChat, sessions, activeId, newChatSession, selectSession, deleteSession } = useApp();
  const [msg, setMsg] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const bottom = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [chat, busy, activeId]);

  async function send(preset?: string) {
    const text = (preset ?? msg).trim();
    if (!text || busy) return;
    pushChat({ role: "user", text });
    setMsg(""); setBusy(true);
    try {
      const r = await fetch("/api/ai?kind=chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, history: [...chat, { role: "user", text }].slice(-8), message: text }) });
      const j = await r.json();
      pushChat({ role: "assistant", text: j.reply });
    } catch {
      pushChat({ role: "assistant", text: "Send failed — try again." });
    } finally { setBusy(false); }
  }

  const presets = [
    "What are my top 2 skill gaps and why do they matter?",
    "Which job should I target first?",
    "What should I learn first and what project proves it?",
  ];

  const rail = (
    <div className="grid content-start gap-1.5">
      <button onClick={newChatSession} className="btn-primary flex items-center justify-center gap-1.5 px-3 py-2.5 text-[13px]">
        <Plus size={15} /> New chat
      </button>
      {sessions.length === 0 && (
        <div className="px-1 py-3 text-center text-[12px]" style={{ color: "#3F4A63" }}>No chats yet.<br />Every conversation is saved here, privately.</div>
      )}
      {sessions.map((s) => (
        <div key={s.id} role="button" tabIndex={0}
          onClick={() => selectSession(s.id)}
          onKeyDown={(e) => { if (e.key === "Enter") selectSession(s.id); }}
          aria-current={s.id === activeId ? true : undefined}
          className="group flex cursor-pointer items-center gap-2 rounded-[10px] border px-3 py-2.5 text-left"
          style={s.id === activeId
            ? { borderColor: "#2B5CFF", background: "#F2F5FF" }
            : { borderColor: "#E2E8F2", background: "#fff" }}>
          <MessageSquare size={14} className="shrink-0" color={s.id === activeId ? "#1E40D8" : "#8B95B0"} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12.5px] font-bold">{s.title}</span>
            <span className="font-data block text-[10px]" style={{ color: "#8B95B0" }}>
              {s.messages.length} MSGS · {new Date(s.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
            </span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
            aria-label={`Delete ${s.title}`} title="Delete chat"
            className="shrink-0 rounded-md p-1 opacity-0 hover:bg-red-50 focus:opacity-100 group-hover:opacity-100" style={{ color: "#DC2626" }}>
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <AppShell requireAuth title="Career assistant" sub={profile ? `Grounded in ${profile.name}'s parsed profile (${profile.skills.slice(0, 5).join(", ") || "no skills"}${jobs.length ? `, ${jobs.length} job(s) compared` : ""}). Never invents experience.` : "Upload a resume to make me profile-aware."}>
      <div className="grid items-start gap-3 lg:grid-cols-[250px_1fr]">
        {/* Desktop rail */}
        <div className="sess-rail card hidden p-3 lg:block">{rail}</div>
        {/* Mobile session picker */}
        <div className="sess-picker flex gap-2 lg:hidden">
          <select
            value={activeId ?? ""} onChange={(e) => selectSession(e.target.value)} aria-label="Choose chat"
            className="min-w-0 flex-1 rounded-[12px] border bg-white px-3 py-2.5 text-[13px] font-medium" style={{ borderColor: "#E2E8F2" }}>
            <option value="" disabled>{sessions.length ? "Choose chat…" : "No chats yet"}</option>
            {sessions.map((s) => <option key={s.id} value={s.id}>{s.title} ({s.messages.length})</option>)}
          </select>
          <button onClick={newChatSession} aria-label="New chat" className="btn-primary grid w-11 shrink-0 place-items-center rounded-[12px]"><Plus size={17} /></button>
        </div>

        <div className="card flex min-h-[54vh] flex-col p-4">
          <div className="grid flex-1 content-start gap-2.5 overflow-y-auto">
            {chat.length === 0 && (
              <div className="grid gap-2 py-6 text-center">
                <Bot size={26} className="mx-auto" color="#2B5CFF" />
                <div className="font-display text-[16px] font-bold">Ask about skills, jobs, projects, or direction</div>
                <div className="mx-auto flex max-w-[560px] flex-wrap justify-center gap-2">
                  {presets.map((p) => <button key={p} onClick={() => send(p)} className="rounded-full border px-3.5 py-2 text-[12.5px] font-medium hover:border-[#2B5CFF]" style={{ borderColor: "#E2E8F2", background: "#fff" }}>{p}</button>)}
                </div>
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} className={`max-w-[82%] rounded-[12px] px-4 py-2.5 text-[13.5px] leading-6 ${m.role === "user" ? "justify-self-end text-white" : "justify-self-start border"}`}
                style={m.role === "user" ? { background: "#2B5CFF" } : { borderColor: "#E2E8F2", background: "#fff" }}>
                {m.text}
              </div>
            ))}
            {busy && <ChatThinking />}
            <div ref={bottom} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
            <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="e.g. Should I learn Docker or AWS first?" className="flex-1 rounded-[12px] border px-4 py-3 text-[13.5px]" style={{ borderColor: "#E2E8F2" }} aria-label="Ask assistant" />
            <button type="submit" disabled={busy || !msg.trim()} className="btn-primary flex items-center gap-1.5 px-5 py-3 text-[13px]"><Send size={15} /> Send</button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
