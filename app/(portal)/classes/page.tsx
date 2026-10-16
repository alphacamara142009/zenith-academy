"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PageHeader, ProgressRing, Reveal, ringColor } from "@/components/ui";
import { assignments, classes, dueLabel, fmtTime, gradeTone, letter } from "@/lib/data";

const linkClass = "block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

export default function Classes() {
  const homeroom = classes.find((c) => c.id === "home");
  const list = classes.filter((c) => c.id !== "home");

  return (
    <>
      <PageHeader title="Classes" subtitle={`${list.length} classes this quarter. Tap one to see its grades.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c, i) => {
          const g = c.grade as number;
          const tone = gradeTone(g);
          const next = assignments.filter((a) => a.classId === c.id).sort((a, b) => a.due.localeCompare(b.due))[0];
          return (
            <Reveal key={c.id} delay={0.03 + i * 0.05}>
              <Link href={`/grades?class=${c.id}`} className={linkClass}>
                <motion.div
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow duration-200 hover:shadow-lg hover:shadow-brand-500/10"
                >
                  <div className={`flex items-center justify-between gap-3 border-b p-4 ${c.soft}`}>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{c.name}</p>
                      <p className="text-sm text-slate-600">
                        {c.teacher} · Room {c.room}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${tone.chip}`}>{letter(g)}</span>
                  </div>

                  <div className="flex items-center gap-4 p-4">
                    <ProgressRing value={g} size={72} stroke={7} colorClass={ringColor(g)} delay={0.1 + i * 0.05}>
                      <span className="text-sm font-bold">{Math.round(g)}%</span>
                    </ProgressRing>
                    <div className="min-w-0 space-y-1 text-sm text-slate-600">
                      <p>
                        🕒 {fmtTime(c.start)} - {fmtTime(c.end)}
                      </p>
                      <p className="truncate">{next ? `📌 ${next.title} · ${dueLabel(next.due)}` : "✅ Nothing due"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-xs font-semibold text-brand-600">
                    <span>View grades</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </div>
                </motion.div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      {homeroom && (
        <Reveal delay={0.3} className="mt-6">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Homeroom</span> · {homeroom.teacher} · Room {homeroom.room} ·{" "}
            {fmtTime(homeroom.start)} - {fmtTime(homeroom.end)}
          </div>
        </Reveal>
      )}
    </>
  );
}