"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Avatar, Card, PageHeader, Reveal } from "@/components/ui";
import { ago, useTick } from "@/lib/demo";
import { threadKey, useChat } from "@/lib/chat";

export type Contact = { name: string; sub: string };

export function Messages({ me, contacts, side }: { me: string; contacts: Contact[]; side: "parent" | "teacher" }) {
  const { threads, send, markRead, unreadIn } = useChat();
  const now = useTick(30000);
  const [active, setActive] = useState(0);
  const [text, setText] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);

  const keyOf = (c: Contact) => (side === "parent" ? threadKey(me, c.name) : threadKey(c.name, me));
  const contact = contacts[active] ?? contacts[0];
  const key = keyOf(contact);
  const msgs = threads[key] ?? [];

  useEffect(() => {
    markRead(me, key);
  }, [me, key, msgs.length, markRead]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [key, msgs.length]);

  function submit() {
    const t = text.trim();
    if (!t) return;
    send(key, me, t);
    setText("");
  }

  return (
    <>
      <PageHeader title="Messages" subtitle={side === "parent" ? "Message your child's teachers." : "Message parents about their students."} />

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Reveal delay={0.04}>
          <Card lift={false}>
            <h2 className="mb-2 font-semibold">Conversations</h2>
            <ul className="space-y-1">
              {contacts.map((c, i) => {
                const k = keyOf(c);
                const last = (threads[k] ?? []).at(-1);
                const unread = unreadIn(me, k);
                return (
                  <li key={c.name}>
                    <button
                      onClick={() => setActive(i)}
                      aria-pressed={i === active}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${i === active ? "bg-brand-50" : "hover:bg-slate-50"}`}
                    >
                      <Avatar name={c.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{c.name}</p>
                        <p className="truncate text-xs text-slate-500">{last ? last.text : c.sub}</p>
                      </div>
                      {unread > 0 && (
                        <motion.span key={unread} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">
                          {unread}
                        </motion.span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card lift={false}>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Avatar name={contact.name} />
              <div>
                <p className="font-semibold">{contact.name}</p>
                <p className="text-xs text-slate-500">{contact.sub}</p>
              </div>
            </div>

            <div ref={boxRef} className="my-3 flex h-[340px] flex-col gap-2 overflow-y-auto pr-1">
              {msgs.length === 0 && <p className="m-auto text-sm text-slate-400">No messages yet. Say hello 👋</p>}
              {msgs.map((m) => {
                const mine = m.from === me;
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? "rounded-br-md bg-brand-600 text-white" : "rounded-bl-md bg-slate-100 text-slate-800"}`}>
                      <p>{m.text}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-slate-400"}`}>{ago(m.at, now)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={`Message ${contact.name}`}
                aria-label="Type a message"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                disabled={!text.trim()}
                onClick={submit}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 hover:bg-brand-700 disabled:opacity-40"
              >
                Send
              </motion.button>
            </div>
          </Card>
        </Reveal>
      </div>
    </>
  );
}