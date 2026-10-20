"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { ago, useTick } from "@/lib/demo";
import { useChat, type SchoolAlert } from "@/lib/chat";

type Template = { icon: string; name: string; title: string; body: string; level: SchoolAlert["level"] };

const TEMPLATES: Template[] = [
  { icon: "🌧️", name: "Weather closure", title: "School is closed tomorrow", body: "Because of severe weather, school is closed tomorrow. Stay safe!", level: "urgent" },
  { icon: "🚌", name: "Early dismissal", title: "Early dismissal today", body: "School dismisses at 12:30 PM. Buses run on the early schedule.", level: "urgent" },
  { icon: "🛡️", name: "Safety drill", title: "Safety drill in progress", body: "This is only a drill. Follow your teacher's instructions.", level: "urgent" },
  { icon: "📢", name: "General notice", title: "Important notice", body: "Please check the portal for details.", level: "notice" },
];

const WHO = ["Student", "Parent", "Teacher"];
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export default function Alerts() {
  const { alerts, sendAlert, clearAlert } = useChat();
  const now = useTick();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState<SchoolAlert["level"]>("urgent");
  const [confirming, setConfirming] = useState(false);

  function pick(t: Template) {
    setTitle(t.title);
    setBody(t.body);
    setLevel(t.level);
    setConfirming(false);
  }

  function send() {
    sendAlert(title.trim(), body.trim(), level);
    setTitle("");
    setBody("");
    setConfirming(false);
  }

  return (
    <>
      <PageHeader title="Alerts" subtitle="Send an urgent message. Everyone sees it until they tap Got it." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.04}>
          <Card lift={false}>
            <h2 className="font-semibold">New alert</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <motion.button
                  key={t.name}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => pick(t)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium hover:border-brand-300 hover:bg-brand-50"
                >
                  <span className="text-lg">{t.icon}</span>
                  {t.name}
                </motion.button>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setConfirming(false);
                }}
                placeholder="Alert title"
                aria-label="Alert title"
                className={inputClass}
              />
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Message" aria-label="Alert message" className={inputClass} />
              <div className="flex gap-2 text-sm">
                {(["urgent", "notice"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    aria-pressed={level === l}
                    className={`rounded-full border px-3 py-1 font-medium capitalize ${
                      level === l ? (l === "urgent" ? "border-rose-300 bg-rose-50 text-rose-700" : "border-amber-300 bg-amber-50 text-amber-700") : "border-slate-200 text-slate-500"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              {!confirming ? (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={!title.trim()}
                  onClick={() => setConfirming(true)}
                  className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/30 hover:bg-rose-700 disabled:opacity-40"
                >
                  Send alert
                </motion.button>
              ) : (
                <>
                  <span className="text-sm font-semibold text-rose-700">Send to everyone?</span>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={send} className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700">
                    Yes, send
                  </motion.button>
                  <button onClick={() => setConfirming(false)} className="text-sm font-medium text-slate-500 hover:text-slate-800">
                    Cancel
                  </button>
                </>
              )}
            </div>
            <p className="mt-4 text-xs text-slate-400">Demo only. Real emergency alerts also need text messages, phone calls, and your school's official safety procedures.</p>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card lift={false}>
            <h2 className="mb-1 font-semibold">Sent alerts</h2>
            <ul className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {alerts.map((a) => (
                  <motion.li
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="py-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{a.title}</p>
                        <p className="text-xs text-slate-400">{ago(a.at, now)}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${a.active ? "bg-rose-100 text-rose-700" : "bg-slate-100 text-slate-500"}`}>
                        {a.active ? "Active" : "Cleared"}
                      </span>
                      {a.active && (
                        <button onClick={() => clearAlert(a.id)} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex gap-2 text-xs">
                      {WHO.map((w) => (
                        <span
                          key={w}
                          className={`rounded-full px-2.5 py-1 font-medium ${a.acks.includes(w) ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}
                        >
                          {w} {a.acks.includes(w) ? "✓ seen" : "waiting"}
                        </span>
                      ))}
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              {alerts.length === 0 && <li className="py-8 text-center text-sm text-slate-400">No alerts sent yet.</li>}
            </ul>
          </Card>
        </Reveal>
      </div>
    </>
  );
}