"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Card, CountUp, Reveal } from "@/components/ui";
import { classes, fmtTime } from "@/lib/data";
import { ROSTER, TEACHER, ago, clock, useDemo, useTick } from "@/lib/demo";
import { useSchool } from "@/lib/school";

// Demo clock: we pretend it is 11:30 AM.
const NOW = 11 * 60 + 30;
const ICON: Record<string, string> = { Restroom: "🚻", Water: "💧", Nurse: "🩺", Office: "🏢", Locker: "🔒", Counselor: "💬" };

export default function TeacherHome() {
  const { passes, announcements, submitted, approvePass, denyPass, returnPass } = useDemo();
  const { school } = useSchool();
  const now = useTick();

  const mine = classes.filter((c) => TEACHER.classIds.includes(c.id));
  const current = mine.find((c) => NOW >= c.start && NOW < c.end);
  const pending = passes.filter((p) => p.status === "pending");
  const active = passes.filter((p) => p.status === "active");
  const hallOn = school.features.hallpass;

  const stats = [
    { label: "Students", node: <CountUp to={ROSTER.length} />, note: "Across your classes", color: "from-brand-500 to-accent-500" },
    {
      label: "Attendance",
      node: <CountUp to={submitted.filter((id) => TEACHER.classIds.includes(id)).length} suffix={` / ${mine.length}`} />,
      note: "Classes submitted today",
      color: "from-emerald-500 to-teal-500",
    },
    { label: "Passes waiting", node: <CountUp to={hallOn ? pending.length : 0} />, note: "Need your approval", color: "from-amber-500 to-orange-500" },
    { label: "Out right now", node: <CountUp to={hallOn ? active.length : 0} />, note: "Students with a pass", color: "from-sky-500 to-cyan-500" },
  ];

  return (
    <>
      <Reveal className="mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 p-6 text-white shadow-lg shadow-brand-500/20 md:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/80">Teacher workspace</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Good morning, {TEACHER.name} 👋</h1>
              {current && (
                <span className="mt-4 inline-block rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
                  ● Now teaching: <b>{current.name}</b> · Room {current.room} · {current.end - NOW} min left
                </span>
              )}
            </div>
            <Link href="/teacher/attendance">
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="inline-block rounded-xl bg-white px-5 py-3 font-semibold text-brand-700 shadow-lg"
              >
                Take attendance →
              </motion.span>
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={0.05 + i * 0.04}>
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

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal delay={0.15} className="lg:col-span-2">
          <Card lift={false}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Hall passes</h2>
              {hallOn && <span className="text-sm text-slate-500">Live</span>}
            </div>

            {!hallOn ? (
              <p className="py-6 text-center text-sm text-slate-400">Hall passes are turned off for this school.</p>
            ) : pending.length === 0 && active.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No passes right now. Everyone is in class. ✅</p>
            ) : (
              <>
                {pending.length > 0 && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Waiting for you</p>}
                <ul className="divide-y divide-slate-100">
                  <AnimatePresence initial={false}>
                    {pending.map((p) => (
                      <motion.li
                        key={p.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-3 py-3"
                      >
                        <Avatar name={p.student} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{p.student}</p>
                          <p className="text-sm text-slate-500">
                            {ICON[p.reason]} {p.reason} · {ago(p.requestedAt, now)}
                          </p>
                        </div>
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          onClick={() => approvePass(p.id)}
                          className="rounded-lg bg-emerald-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-600"
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.93 }}
                          onClick={() => denyPass(p.id)}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                        >
                          Deny
                        </motion.button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>

                {active.length > 0 && <p className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Out right now</p>}
                <ul className="divide-y divide-slate-100">
                  <AnimatePresence initial={false}>
                    {active.map((p) => {
                      const out = now - (p.startedAt ?? now);
                      return (
                        <motion.li
                          key={p.id}
                          layout
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          transition={{ duration: 0.25 }}
                          className="flex items-center gap-3 py-3"
                        >
                          <Avatar name={p.student} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{p.student}</p>
                            <p className="text-sm text-slate-500">
                              {ICON[p.reason]} {p.reason}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-sm font-bold tabular-nums ${
                              out > 8 * 60000 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {clock(out)}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.93 }}
                            onClick={() => returnPass(p.id)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Mark returned
                          </motion.button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </>
            )}
          </Card>
        </Reveal>

        <div className="space-y-6">
          <Reveal delay={0.2}>
            <Card lift={false}>
              <h2 className="mb-3 font-semibold">Your classes today</h2>
              <ul className="space-y-3">
                {mine.map((c) => {
                  const done = submitted.includes(c.id);
                  return (
                    <li key={c.id} className={`rounded-xl border p-3 ${c.soft}`}>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {fmtTime(c.start)} - {fmtTime(c.end)} · Room {c.room}
                      </p>
                      <p className="mt-2 text-xs font-semibold">
                        {done ? (
                          <span className="text-emerald-600">✓ Attendance submitted</span>
                        ) : (
                          <Link href="/teacher/attendance" className="text-brand-600 hover:text-brand-700">
                            Take attendance →
                          </Link>
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </Reveal>

          <Reveal delay={0.25}>
            <Card lift={false}>
              <h2 className="mb-3 font-semibold">School announcements</h2>
              <ul className="space-y-3">
                {announcements.slice(0, 2).map((a) => (
                  <li key={a.id}>
                    <p className="text-sm font-semibold">{a.title}</p>
                    <p className="text-xs text-slate-400">
                      {a.author} · {ago(a.at, now)}
                    </p>
                  </li>
                ))}
                {announcements.length === 0 && <li className="text-sm text-slate-400">Nothing posted yet.</li>}
              </ul>
            </Card>
          </Reveal>
        </div>
      </div>
    </>
  );
}