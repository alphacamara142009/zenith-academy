"use client";

import { motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { daysUntil, dueLabel } from "@/lib/data";
import { useStored } from "@/lib/persist";

const SPOTS = [
  { id: 1, title: "Picture Day helpers", date: "2026-10-18", time: "8:00 - 11:00 AM", hours: 3, spots: 6, taken: 4 },
  { id: 2, title: "Book Fair checkout table", date: "2026-10-27", time: "12:00 - 3:00 PM", hours: 3, spots: 4, taken: 1 },
  { id: 3, title: "Science Fair judges", date: "2026-11-12", time: "5:30 - 8:00 PM", hours: 2.5, spots: 8, taken: 8 },
  { id: 4, title: "Winter Concert setup crew", date: "2026-12-12", time: "4:00 - 6:00 PM", hours: 2, spots: 5, taken: 2 },
];

export default function VolunteerPage() {
  const [mine, setMine] = useStored<number[]>("zenith-volunteer", []);
  const hours = SPOTS.filter((s) => mine.includes(s.id)).reduce((a, s) => a + s.hours, 0);

  const toggle = (id: number) => setMine((m) => (m.includes(id) ? m.filter((x) => x !== id) : [...m, id]));

  return (
    <>
      <PageHeader title="Volunteer" subtitle={hours > 0 ? `You signed up for ${hours} hours. Thank you!` : "Pick a way to help at school."} />

      <div className="grid gap-4 md:grid-cols-2">
        {SPOTS.map((s, i) => {
          const joined = mine.includes(s.id);
          const taken = s.taken + (joined ? 1 : 0);
          const full = taken >= s.spots && !joined;
          const left = s.spots - taken;
          return (
            <Reveal key={s.id} delay={0.04 * i}>
              <Card>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {dueLabel(s.date)} · {s.time}
                    </p>
                    <p className="text-xs text-slate-400">{daysUntil(s.date)} days away · {s.hours} hours</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${full ? "bg-slate-100 text-slate-500" : left <= 2 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {full ? "Full" : `${left} spots left`}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div animate={{ width: `${(taken / s.spots) * 100}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full bg-brand-500" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={full}
                  onClick={() => toggle(s.id)}
                  className={`mt-4 h-10 w-full rounded-xl text-sm font-semibold transition-colors disabled:opacity-40 ${
                    joined ? "bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-600" : "bg-brand-600 text-white shadow-md shadow-brand-500/25"
                  }`}
                >
                  {joined ? "✓ You are signed up (tap to cancel)" : full ? "No spots left" : "Sign up"}
                </motion.button>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
