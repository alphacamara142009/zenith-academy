"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Card, CountUp, PageHeader, Reveal } from "@/components/ui";
import { usePortal } from "@/lib/store";
import { TODAY, assignments, attendance, classes, daysUntil, dueLabel, events, fmtTime, iso, letter, quarters, student } from "@/lib/data";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const linkClass = "block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

export default function Dashboard() {
  const { unread } = usePortal();
  const [done, setDone] = useState<number[]>([]);

  const graded = classes.filter((c) => c.grade !== null);
  const overall = graded.reduce((s, c) => s + (c.grade as number), 0) / graded.length;
  const attTotal = attendance.present + attendance.tardy + attendance.absent;
  const attPct = ((attendance.present + attendance.tardy) / attTotal) * 100;

  const monday = new Date(TODAY);
  monday.setDate(TODAY.getDate() - ((TODAY.getDay() + 6) % 7));
  const week = dayNames.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { name, d, key: iso(d), evs: events.filter((e) => e.date === iso(d)) };
  });
  const todayKey = iso(TODAY);

  const stats = [
    { label: "Overall grade", href: "/grades", node: <CountUp to={overall} decimals={1} suffix="%" />, note: `Quarter 1 · ${letter(overall)}`, color: "from-indigo-500 to-violet-500" },
    { label: "Attendance", href: "/attendance", node: <CountUp to={attPct} decimals={1} suffix="%" />, note: `${attendance.absent} absence, ${attendance.tardy} tardies`, color: "from-emerald-500 to-teal-500" },
    { label: "My classes", href: "/classes", node: <CountUp to={classes.length - 1} />, note: "Enrolled this quarter", color: "from-sky-500 to-cyan-500" },
    { label: "Unread", href: "/notifications", node: <CountUp to={unread} />, note: "New notifications", color: "from-amber-500 to-orange-500" },
  ];

  const links = [
    ["Grades", "/grades", "📊"],
    ["Schedule", "/schedule", "🕒"],
    ["Attendance", "/attendance", "✅"],
    ["Calendar", "/calendar", "📅"],
  ];

  return (
    <>
      <PageHeader
        title={`Hi, ${student.first}! 👋`}
        subtitle={TODAY.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      />

      <Reveal delay={0.03} className="mb-6">
        <Link href="/calendar" className={linkClass}>
          <Card lift={false}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">School Year 2026-2027</h2>
              <span className="text-sm text-slate-500">Quarter 1 · 100% through</span>
            </div>
            <div className="flex gap-1.5">
              {quarters.map((q) => (
                <div key={q.name} style={{ flexGrow: q.days }} className="basis-0">
                  <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${q.done}%` }}
                      transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <p className="mt-2 text-xs font-medium">{q.name}</p>
                  <p className="text-[11px] text-slate-400">{q.range}</p>
                </div>
              ))}
            </div>
          </Card>
        </Link>
      </Reveal>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={0.05 + i * 0.04}>
            <Link href={s.href} className={linkClass}>
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-lg`}
              >
                <p className="text-sm opacity-90">{s.label}</p>
                <p className="mt-1 text-4xl font-bold">{s.node}</p>
                <p className="mt-1 text-xs opacity-80">{s.note}</p>
                <p className="mt-3 text-xs font-semibold opacity-90">View details →</p>
              </motion.div>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.12} className="mb-6">
        <Card lift={false}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Today</h2>
            <span className="text-sm text-slate-500">{events.find((e) => e.date === todayKey)?.title ?? "Regular school day"}</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {classes.map((c, i) => (
              <Link
                key={c.id}
                href="/schedule"
                style={{ flexGrow: c.end - c.start, minWidth: c.id === "home" ? 56 : 120 }}
                className="basis-0"
              >
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.03, duration: 0.25 }}
                  whileHover={{ y: -2 }}
                  className={`h-full rounded-xl border p-3 ${c.soft}`}
                >
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {fmtTime(c.start)} - {fmtTime(c.end)}
                  </p>
                </motion.div>
              </Link>
            ))}
          </div>
        </Card>
      </Reveal>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">This week</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {week.map((w, i) => {
          const isToday = w.key === todayKey;
          return (
            <Reveal key={w.key} delay={0.15 + i * 0.03}>
              <Link href="/calendar" className={linkClass}>
                <div
                  className={`rounded-2xl border p-3 transition-shadow hover:shadow-md ${
                    isToday ? "border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-200" : "border-slate-200 bg-white"
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-500">
                    {w.name.toUpperCase()} <span className="text-slate-900">{w.d.getDate()}</span>
                  </p>
                  {w.evs.length === 0 ? (
                    <p className="mt-2 text-slate-300">-</p>
                  ) : (
                    w.evs.map((e) => (
                      <p
                        key={e.title}
                        className={`mt-2 rounded-lg px-2 py-1 text-[11px] font-medium ${
                          e.kind === "off" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {e.title}
                      </p>
                    ))
                  )}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal delay={0.2} className="lg:col-span-2">
          <Card lift={false}>
            <h2 className="mb-3 font-semibold">Due soon</h2>
            <ul className="divide-y divide-slate-100">
              {assignments.map((a) => {
                const isDone = done.includes(a.id);
                const cls = classes.find((c) => c.id === a.classId);
                const urgent = daysUntil(a.due) <= 1;
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => setDone((d) => (isDone ? d.filter((x) => x !== a.id) : [...d, a.id]))}
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs ${
                        isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                      }`}
                      aria-label="Mark done"
                    >
                      {isDone ? "✓" : ""}
                    </motion.button>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-medium ${isDone ? "text-slate-400 line-through" : ""}`}>{a.title}</p>
                      <p className="text-sm text-slate-500">{cls?.name}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        urgent && !isDone ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {dueLabel(a.due)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.25}>
          <Card lift={false}>
            <h2 className="mb-3 font-semibold">Jump to</h2>
            <div className="grid grid-cols-2 gap-3">
              {links.map(([label, href, icon]) => (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="rounded-xl bg-slate-50 p-4 text-center text-sm font-medium"
                  >
                    <div className="mb-1 text-2xl">{icon}</div>
                    {label}
                  </motion.div>
                </Link>
              ))}
            </div>
          </Card>
        </Reveal>
      </div>
    </>
  );
}