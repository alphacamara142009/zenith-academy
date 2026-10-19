"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Avatar, Card, CountUp, ProgressRing, Reveal } from "@/components/ui";
import { assignments, attendance, classes, daysUntil, dueLabel, fmtTime, gradeTone, letter, student } from "@/lib/data";
import { useExtra } from "@/lib/extra";

// Demo clock: we pretend it is 11:30 AM.
const NOW = 11 * 60 + 30;
const PARENT = "Dana";

export default function ParentHome() {
  const { absences } = useExtra();

  const graded = classes.filter((c) => c.grade !== null);
  const overall = graded.reduce((s, c) => s + (c.grade as number), 0) / graded.length;
  const attTotal = attendance.present + attendance.tardy + attendance.absent;
  const attPct = ((attendance.present + attendance.tardy) / attTotal) * 100;
  const nowClass = classes.find((c) => NOW >= c.start && NOW < c.end);

  const ranked = [...graded].sort((a, b) => (b.grade as number) - (a.grade as number));
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const urgent = assignments.filter((a) => daysUntil(a.due) <= 1).length;

  const stats = [
    { label: "Overall grade", node: <CountUp to={overall} decimals={1} suffix="%" />, note: `Quarter 1 · ${letter(overall)}`, color: "from-brand-500 to-accent-500" },
    { label: "Attendance", node: <CountUp to={attPct} decimals={1} suffix="%" />, note: `${attendance.absent} absence, ${attendance.tardy} tardies`, color: "from-emerald-500 to-teal-500" },
    { label: "Due soon", node: <CountUp to={urgent} />, note: "Due today or tomorrow", color: "from-amber-500 to-orange-500" },
    { label: "Absences reported", node: <CountUp to={absences.length} />, note: "By you this year", color: "from-sky-500 to-cyan-500" },
  ];

  return (
    <>
      <Reveal className="mb-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 p-6 text-white shadow-lg shadow-brand-500/20 md:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full ring-4 ring-white/30">
                <Avatar name={student.name} size={64} />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Parent portal</p>
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Hi, {PARENT}! 👋</h1>
                <p className="text-white/80">Here is how {student.first} is doing.</p>
                {nowClass && (
                  <span className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur">
                    ● Right now: <b>{nowClass.name}</b> · Room {nowClass.room}
                  </span>
                )}
              </div>
            </div>
            <ProgressRing value={overall} size={96} stroke={9} colorClass="text-white" trackClass="text-white/25" delay={0.2}>
              <div className="text-center">
                <p className="text-xl font-bold leading-none">{overall.toFixed(0)}%</p>
                <p className="mt-1 text-[11px] text-white/80">Overall</p>
              </div>
            </ProgressRing>
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

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Reveal delay={0.15} className="lg:col-span-2">
          <Card lift={false}>
            <h2 className="mb-1 font-semibold">This week at a glance</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                🌟 {student.first} is doing best in <b>{best.name}</b> ({(best.grade as number).toFixed(1)}%).
              </li>
              <li>
                🎯 <b>{worst.name}</b> could use the most support ({(worst.grade as number).toFixed(1)}%). A quick check-in with {worst.teacher} can help.
              </li>
              <li>
                📌 {urgent} {urgent === 1 ? "assignment is" : "assignments are"} due today or tomorrow.
              </li>
              <li>
                ⏰ {attendance.tardy} tardies this year. {attendance.tardy > 1 ? "Arriving a few minutes earlier would help." : "Nice and steady."}
              </li>
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.2}>
          <Card lift={false}>
            <h2 className="mb-3 font-semibold">Quick actions</h2>
            <Link href="/parent/absence">
              <motion.span
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="block rounded-xl bg-brand-600 px-4 py-3 text-center font-semibold text-white shadow-md shadow-brand-500/30 hover:bg-brand-700"
              >
                📝 Report an absence
              </motion.span>
            </Link>
            <p className="mt-3 text-xs text-slate-400">Messaging with teachers and conference sign-ups are coming soon.</p>
          </Card>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.25}>
          <Card lift={false}>
            <h2 className="mb-3 font-semibold">Grades by class</h2>
            <ul className="space-y-4">
              {graded.map((c, i) => {
                const g = c.grade as number;
                const t = gradeTone(g);
                return (
                  <li key={c.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.teacher}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${t.chip}`}>
                        {g.toFixed(1)}% · {letter(g)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        className={`h-full rounded-full ${t.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${g}%` }}
                        transition={{ duration: 0.7, delay: 0.3 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>

        <Reveal delay={0.3}>
          <Card lift={false}>
            <h2 className="mb-1 font-semibold">Coming up</h2>
            <ul className="divide-y divide-slate-100">
              {assignments.map((a) => {
                const cls = classes.find((c) => c.id === a.classId);
                const hot = daysUntil(a.due) <= 1;
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{a.title}</p>
                      <p className="text-sm text-slate-500">
                        {cls?.name} · {cls ? fmtTime(cls.start) : ""}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hot ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"}`}>
                      {dueLabel(a.due)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>
      </div>
    </>
  );
}