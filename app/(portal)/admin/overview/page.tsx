"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Card, CountUp, PageHeader, ProgressRing, Reveal } from "@/components/ui";
import { ago, clock, useDemo, useTick } from "@/lib/demo";
import { FEATURES, useSchool } from "@/lib/school";

const ABSENCES = [
  { d: "Mon", n: 12 },
  { d: "Tue", n: 9 },
  { d: "Wed", n: 14 },
  { d: "Thu", n: 7 },
  { d: "Fri", n: 11 },
];
const GRADES = [
  { g: "A", n: 142, bar: "bg-emerald-500" },
  { g: "B", n: 171, bar: "bg-sky-500" },
  { g: "C", n: 102, bar: "bg-amber-500" },
  { g: "D", n: 45, bar: "bg-orange-500" },
  { g: "F", n: 22, bar: "bg-rose-500" },
];
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export default function Overview() {
  const { school } = useSchool();
  const { passes, announcements, postAnnouncement, removeAnnouncement } = useDemo();
  const now = useTick();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const active = passes.filter((p) => p.status === "active");
  const waiting = passes.filter((p) => p.status === "pending").length;
  const enabled = FEATURES.filter((f) => school.features[f.key]).length;
  const maxAbs = Math.max(...ABSENCES.map((a) => a.n));
  const maxGrade = Math.max(...GRADES.map((g) => g.n));

  function post() {
    const t = title.trim();
    if (!t) return;
    postAnnouncement(t, body.trim(), "Admin Office");
    setTitle("");
    setBody("");
  }

  const stats = [
    { label: "Students enrolled", node: <CountUp to={482} />, note: "Sample data", color: "from-brand-500 to-accent-500" },
    { label: "Present today", node: <CountUp to={96.4} decimals={1} suffix="%" />, note: "Sample data", color: "from-emerald-500 to-teal-500" },
    { label: "Passes out now", node: <CountUp to={school.features.hallpass ? active.length : 0} />, note: `${school.features.hallpass ? waiting : 0} waiting for approval`, color: "from-sky-500 to-cyan-500" },
    { label: "Staff", node: <CountUp to={37} />, note: "Sample data", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <>
      <PageHeader title="Overview" subtitle={`${school.name} at a glance.`} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={0.04 + i * 0.04}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-lg`}
            >
              <p className="text-sm opacity-90">{s.label}</p>
              <p className="mt-1 text-4xl font-bold">{s.node}</p>
              <p className="mt-1 text-xs opacity-80">{s.note}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.12}>
          <Card lift={false}>
            <h2 className="font-semibold">Absences this week</h2>
            <p className="text-sm text-slate-500">Students marked absent each day.</p>
            <div className="mt-4 flex h-40 items-end justify-between gap-3">
              {ABSENCES.map((a, i) => (
                <div key={a.d} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs font-semibold text-slate-600">{a.n}</span>
                  <motion.div
                    className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-accent-400"
                    initial={{ height: 0 }}
                    animate={{ height: `${(a.n / maxAbs) * 85}%` }}
                    transition={{ duration: 0.7, delay: 0.2 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <span className="text-xs text-slate-400">{a.d}</span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.16}>
          <Card lift={false}>
            <h2 className="font-semibold">Grade distribution</h2>
            <p className="text-sm text-slate-500">Students by overall letter grade.</p>
            <div className="mt-4 space-y-3">
              {GRADES.map((g, i) => (
                <div key={g.g} className="flex items-center gap-3 text-sm">
                  <span className="w-5 font-bold">{g.g}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className={`h-full rounded-full ${g.bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(g.n / maxGrade) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="w-10 text-right font-semibold tabular-nums">{g.n}</span>
                </div>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal delay={0.2} className="lg:col-span-2">
          <Card lift={false}>
            <h2 className="font-semibold">Announcements</h2>
            <p className="text-sm text-slate-500">Students see the newest one as a banner in their portal.</p>
            <div className="mt-4 space-y-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className={inputClass} aria-label="Announcement title" />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Message (optional)"
                rows={2}
                className={inputClass}
                aria-label="Announcement message"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!title.trim()}
                onClick={post}
                className="rounded-xl bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/30 hover:bg-brand-700 disabled:opacity-40"
              >
                Post announcement
              </motion.button>
            </div>

            <ul className="mt-5 divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {announcements.map((a) => (
                  <motion.li
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-3 py-3"
                  >
                    <span className="text-xl">📣</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{a.title}</p>
                      {a.body && <p className="text-sm text-slate-500">{a.body}</p>}
                      <p className="mt-0.5 text-xs text-slate-400">
                        {a.author} · {ago(a.at, now)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAnnouncement(a.id)}
                      aria-label="Delete announcement"
                      className="rounded-lg px-2 py-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
              {announcements.length === 0 && <li className="py-4 text-sm text-slate-400">No announcements yet.</li>}
            </ul>
          </Card>
        </Reveal>

        <div className="space-y-6">
          <Reveal delay={0.24}>
            <Card lift={false}>
              <h2 className="mb-3 font-semibold">Live hall passes</h2>
              {!school.features.hallpass ? (
                <p className="text-sm text-slate-400">Turned off in Settings.</p>
              ) : active.length === 0 ? (
                <p className="text-sm text-slate-400">No one is out right now.</p>
              ) : (
                <ul className="space-y-3">
                  {active.map((p) => (
                    <li key={p.id} className="flex items-center gap-3">
                      <Avatar name={p.student} size={32} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{p.student}</p>
                        <p className="text-xs text-slate-400">{p.reason}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold tabular-nums text-emerald-700">
                        {clock(now - (p.startedAt ?? now))}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Reveal>

          <Reveal delay={0.28}>
            <Card lift={false}>
              <h2 className="mb-3 font-semibold">Features in use</h2>
              <div className="flex items-center gap-4">
                <ProgressRing value={(enabled / FEATURES.length) * 100} size={72} stroke={8} delay={0.3}>
                  <span className="text-sm font-bold">
                    {enabled}/{FEATURES.length}
                  </span>
                </ProgressRing>
                <div>
                  <p className="text-sm text-slate-500">Features switched on for your school.</p>
                  <Link href="/admin" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                    Manage features →
                  </Link>
                </div>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </>
  );
}