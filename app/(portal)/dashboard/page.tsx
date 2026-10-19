"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Card, CountUp, ProgressRing, Reveal } from "@/components/ui";
import { usePortal } from "@/lib/store";
import { useSchool } from "@/lib/school";
import { TODAY, assignments, attendance, classes, daysUntil, dueLabel, events, fmtTime, iso, letter, quarters, student } from "@/lib/data";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const linkClass = "block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

// Demo clock: we pretend it is 11:30 AM so "Now" and "Next up" always look right. Real time comes later.
const NOW = 11 * 60 + 30;

export default function Dashboard() {
  const { unread } = usePortal();
  const { school } = useSchool();
  const on = school.features;
  const [done, setDone] = useState<number[]>([]);

  const graded = classes.filter((c) => c.grade !== null);
  const overall = graded.reduce((s, c) => s + (c.grade as number), 0) / graded.length;
  const attTotal = attendance.present + attendance.tardy + attendance.absent;
  const attPct = ((attendance.present + attendance.tardy) / attTotal) * 100;

  const nowClass = classes.find((c) => NOW >= c.start && NOW < c.end);
  const nextClass = classes.find((c) => c.start > NOW);
  const dayStart = classes[0].start;
  const dayEnd = classes[classes.length - 1].end;
  const dayPct = Math.max(0, Math.min(100, ((NOW - dayStart) / (dayEnd - dayStart)) * 100));

  const monday = new Date(TODAY);
  monday.setDate(TODAY.getDate() - ((TODAY.getDay() + 6) % 7));
  const week = dayNames.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { name, d, key: iso(d), evs: events.filter((e) => e.date === iso(d)) };
  });
  const todayKey = iso(TODAY);

  const doneCount = assignments.filter((a) => done.includes(a.id)).length;

  const stats = [
    { show: on.grades, label: "Overall grade", href: "/grades", node: <CountUp to={overall} decimals={1} suffix="%" />, note: `Quarter 1 · ${letter(overall)}`, color: "from-brand-500 to-accent-500" },
    { show: on.attendance, label: "Attendance", href: "/attendance", node: <CountUp to={attPct} decimals={1} suffix="%" />, note: `${attendance.absent} absence, ${attendance.tardy} tardies`, color: "from-emerald-500 to-teal-500" },
    { show: on.classes, label: "My classes", href: "/classes", node: <CountUp to={classes.length - 1} />, note: "Enrolled this quarter", color: "from-sky-500 to-cyan-500" },
    { show: on.notifications, label: "Unread", href: "/notifications", node: <CountUp to={unread} />, note: "New notifications", color: "from-amber-500 to-orange-500" },
  ].filter((s) => s.show);

  const links: [string, string, string, boolean][] = [
    ["Grades", "/grades", "📊", on.grades],
    ["Schedule", "/schedule", "🕒", on.schedule],
    ["Attendance", "/attendance", "✅", on.attendance],
    ["Calendar", "/calendar", "📅", on.calendar],
  ];
  const shownLinks = links.filter((l) => l[3]);

  return (
    <>
      <Reveal className="mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 p-6 text-white shadow-lg shadow-brand-500/20 md:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-white/80">
                {TODAY.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">Hi, {student.first}! 👋</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {nowClass && (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
                    ● Now: <b>{nowClass.name}</b> · {nowClass.end - NOW} min left
                  </span>
                )}
                {nextClass && (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-sm backdrop-blur">
                    Next: <b>{nextClass.name}</b> · {fmtTime(nextClass.start)}
                  </span>
                )}
              </div>
            </div>
            {on.grades && (
              <Link href="/grades" aria-label="Open grades">
                <ProgressRing value={overall} size={96} stroke={9} colorClass="text-white" trackClass="text-white/25" delay={0.2}>
                  <div className="text-center">
                    <p className="text-xl font-bold leading-none">{overall.toFixed(0)}%</p>
                    <p className="mt-1 text-[11px] text-white/80">Overall</p>
                  </div>
                </ProgressRing>
              </Link>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.05} className="mb-6">
        <Link href={on.calendar ? "/calendar" : "/dashboard"} className={linkClass}>
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
                      className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
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

      {stats.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={0.08 + i * 0.04}>
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
      )}

      <Reveal delay={0.12} className="mb-6">
        <Card lift={false}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Today</h2>
            <span className="text-sm text-slate-500">{events.find((e) => e.date === todayKey)?.title ?? "Regular school day"}</span>
          </div>
          <div className="relative h-1.5 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
              initial={{ width: 0 }}
              animate={{ width: `${dayPct}%` }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="mb-4 mt-2 text-xs text-slate-400">
            {fmtTime(NOW)} · {Math.round(dayPct)}% of the school day
          </p>
          <div className="flex gap-1 overflow-x-auto px-1 pb-1 pt-2">
            {classes.map((c, i) => {
              const isNow = nowClass?.id === c.id;
              const past = NOW >= c.end;
              return (
                <Link
                  key={c.id}
                  href={on.schedule ? "/schedule" : "/dashboard"}
                  style={{ flexGrow: c.end - c.start, minWidth: c.id === "home" ? 56 : 120 }}
                  className="basis-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: past ? 0.55 : 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.03, duration: 0.25 }}
                    whileHover={{ y: -2 }}
                    className={`relative h-full rounded-xl border p-3 ${c.soft} ${isNow ? "ring-2 ring-brand-500 ring-offset-2" : ""}`}
                  >
                    {isNow && (
                      <span className="absolute -top-2 right-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">NOW</span>
                    )}
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {fmtTime(c.start)} - {fmtTime(c.end)}
                    </p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </Card>
      </Reveal>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">This week</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {week.map((w, i) => {
          const isToday = w.key === todayKey;
          return (
            <Reveal key={w.key} delay={0.15 + i * 0.03}>
              <Link href={on.calendar ? "/calendar" : "/dashboard"} className={linkClass}>
                <div
                  className={`rounded-2xl border p-3 transition-shadow hover:shadow-md ${
                    isToday ? "border-brand-400 bg-brand-50/60 ring-2 ring-brand-200" : "border-slate-200 bg-white"
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
        <Reveal delay={0.2} className={shownLinks.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card lift={false}>
            <div className="mb-1 flex items-center justify-between">
              <h2 className="font-semibold">Due soon</h2>
              <span className="text-sm text-slate-500">
                {doneCount} of {assignments.length} done
              </span>
            </div>
            <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                animate={{ width: `${(doneCount / assignments.length) * 100}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 26 }}
              />
            </div>
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
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-colors ${
                        isDone ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-brand-400"
                      }`}
                      aria-label={isDone ? "Mark not done" : "Mark done"}
                    >
                      {isDone && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                          ✓
                        </motion.span>
                      )}
                    </motion.button>
                    <div className="min-w-0 flex-1">
                      <p className={`truncate font-medium transition-colors ${isDone ? "text-slate-400 line-through" : ""}`}>{a.title}</p>
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

        {shownLinks.length > 0 && (
          <Reveal delay={0.25}>
            <Card lift={false}>
              <h2 className="mb-3 font-semibold">Jump to</h2>
              <div className="grid grid-cols-2 gap-3">
                {shownLinks.map(([label, href, icon]) => (
                  <Link key={href} href={href}>
                    <motion.div
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                      className="rounded-xl bg-slate-50 p-4 text-center text-sm font-medium transition-colors hover:bg-brand-50"
                    >
                      <div className="mb-1 text-2xl">{icon}</div>
                      {label}
                    </motion.div>
                  </Link>
                ))}
              </div>
            </Card>
          </Reveal>
        )}
      </div>
    </>
  );
}