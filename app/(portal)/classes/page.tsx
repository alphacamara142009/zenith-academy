"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { PageHeader, Reveal } from "@/components/ui";
import { assignments, classes, dueLabel, fmtTime, gradeTone, letter } from "@/lib/data";

const linkClass = "block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2";

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
            <Reveal key={c.id} delay={0.03 + i * 0.04}>
              <Link href={`/grades?class=${c.id}`} className={linkClass}>
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className={`border-b p-4 ${c.soft}`}>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-slate-600">
                      {c.teacher} · Room {c.room}
                    </p>
                  </div>
                  <div className="p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-3xl font-bold">{g.toFixed(1)}%</p>
                        <p className="text-xs text-slate-500">Current grade</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-sm font-bold ${tone.chip}`}>{letter(g)}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        className={`h-full rounded-full ${tone.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${g}%` }}
                        transition={{ duration: 0.7, delay: 0.15 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <div className="mt-4 space-y-1 text-sm text-slate-600">
                      <p>
                        🕒 {fmtTime(c.start)} - {fmtTime(c.end)}
                      </p>
                      <p>{next ? `📌 Next: ${next.title} · ${dueLabel(next.due)}` : "✅ Nothing due"}</p>
                    </div>
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