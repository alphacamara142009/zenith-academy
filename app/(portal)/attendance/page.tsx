"use client";

import { motion } from "motion/react";
import { Card, CountUp, PageHeader, Reveal } from "@/components/ui";
import { TODAY, attendance, iso } from "@/lib/data";
import { isNoSchool, parseKey } from "@/lib/calendar";

type Status = "present" | "tardy" | "absent";

const marks: Record<string, { status: Status; note: string }> = {
  "2026-09-22": { status: "tardy", note: "English III" },
  "2026-10-06": { status: "absent", note: "Excused" },
  "2026-10-14": { status: "tardy", note: "American Government" },
};

const look: Record<Status, { box: string; chip: string; label: string }> = {
  present: { box: "bg-emerald-400", chip: "bg-emerald-100 text-emerald-700", label: "Present" },
  tardy: { box: "bg-amber-400", chip: "bg-amber-100 text-amber-700", label: "Tardy" },
  absent: { box: "bg-rose-400", chip: "bg-rose-100 text-rose-700", label: "Absent" },
};

function schoolDays() {
  const out: Date[] = [];
  const end = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()).getTime();
  for (let d = new Date(2026, 8, 3); d.getTime() <= end; d.setDate(d.getDate() + 1)) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6 && !isNoSchool(iso(d))) out.push(new Date(d));
  }
  return out;
}

export default function Attendance() {
  const days = schoolDays();
  const total = attendance.present + attendance.tardy + attendance.absent;
  const rate = ((attendance.present + attendance.tardy) / total) * 100;
  const exceptions = Object.entries(marks).sort((a, b) => b[0].localeCompare(a[0]));

  const cards = [
    { label: "Attendance rate", node: <CountUp to={rate} decimals={1} suffix="%" />, color: "from-brand-500 to-accent-500" },
    { label: "Days present", node: <CountUp to={attendance.present} />, color: "from-emerald-500 to-teal-500" },
    { label: "Tardies", node: <CountUp to={attendance.tardy} />, color: "from-amber-500 to-orange-500" },
    { label: "Absences", node: <CountUp to={attendance.absent} />, color: "from-rose-500 to-pink-500" },
  ];

  return (
    <>
      <PageHeader title="Attendance" subtitle="Your attendance for this school year." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c.label} delay={0.04 + i * 0.04}>
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`rounded-2xl bg-gradient-to-br ${c.color} p-5 text-white shadow-lg`}
            >
              <p className="text-sm opacity-90">{c.label}</p>
              <p className="mt-1 text-4xl font-bold">{c.node}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.15} className="mb-6">
        <Card lift={false}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Last {days.length} school days</h2>
            <div className="flex gap-3 text-xs text-slate-500">
              {(Object.keys(look) as Status[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={`h-3 w-3 rounded ${look[s].box}`} /> {look[s].label}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {days.map((d, i) => {
              const key = iso(d);
              const st: Status = marks[key]?.status ?? "present";
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.012, duration: 0.2 }}
                  whileHover={{ scale: 1.25 }}
                  title={`${d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}: ${look[st].label}`}
                  className={`h-7 w-7 rounded-md ${look[st].box}`}
                />
              );
            })}
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.22}>
        <Card lift={false}>
          <h2 className="mb-3 font-semibold">Tardies and absences</h2>
          <ul className="divide-y divide-slate-100">
            {exceptions.map(([key, m]) => (
              <li key={key} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">
                    {parseKey(key).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                  </p>
                  <p className="text-sm text-slate-500">{m.note}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${look[m.status].chip}`}>{look[m.status].label}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Reveal>
    </>
  );
}