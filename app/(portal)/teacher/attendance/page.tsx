"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Card, PageHeader, Reveal } from "@/components/ui";
import { classes, fmtTime } from "@/lib/data";
import { ROSTER, TEACHER, useDemo, type Mark } from "@/lib/demo";

const OPTIONS: { key: Mark; label: string; on: string }[] = [
  { key: "present", label: "Present", on: "bg-emerald-500" },
  { key: "tardy", label: "Tardy", on: "bg-amber-500" },
  { key: "absent", label: "Absent", on: "bg-rose-500" },
];

export default function TeacherAttendance() {
  const { marks, submitted, setMark, markAll, submit, reopen } = useDemo();
  const mine = classes.filter((c) => TEACHER.classIds.includes(c.id));
  const [cid, setCid] = useState(mine[0].id);
  const cls = mine.find((c) => c.id === cid) ?? mine[0];
  const locked = submitted.includes(cls.id);

  const markOf = (s: string): Mark => marks[cls.id]?.[s] ?? "present";
  const count = (m: Mark) => ROSTER.filter((s) => markOf(s) === m).length;

  return (
    <>
      <PageHeader title="Attendance" subtitle="Everyone starts as present. Tap only the exceptions, then submit." />

      <Reveal delay={0.03} className="mb-4">
        <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1">
          {mine.map((c) => (
            <button
              key={c.id}
              onClick={() => setCid(c.id)}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium ${cid === c.id ? "text-brand-700" : "text-slate-500 hover:text-slate-800"}`}
            >
              {cid === c.id && (
                <motion.span
                  layoutId="att-tab"
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">
                {c.name} {submitted.includes(c.id) && "✓"}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <Card lift={false}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{cls.name}</h2>
              <p className="text-sm text-slate-500">
                {fmtTime(cls.start)} - {fmtTime(cls.end)} · Room {cls.room}
              </p>
            </div>
            <div className="flex gap-2 text-sm font-semibold">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">{count("present")} present</span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">{count("tardy")} tardy</span>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">{count("absent")} absent</span>
            </div>
          </div>

          <ul className={`divide-y divide-slate-100 ${locked ? "opacity-60" : ""}`}>
            {ROSTER.map((s) => {
              const current = markOf(s);
              return (
                <li key={s} className="flex items-center gap-3 py-2.5">
                  <Avatar name={s} size={34} />
                  <p className="min-w-0 flex-1 truncate font-medium">{s}</p>
                  <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                    {OPTIONS.map((o) => (
                      <button
                        key={o.key}
                        disabled={locked}
                        onClick={() => setMark(cls.id, s, o.key)}
                        aria-pressed={current === o.key}
                        className={`relative rounded-lg px-2.5 py-1 text-xs font-semibold ${current === o.key ? "text-white" : "text-slate-500 hover:text-slate-800"}`}
                      >
                        {current === o.key && (
                          <motion.span
                            layoutId={`mark-${cls.id}-${s}`}
                            className={`absolute inset-0 rounded-lg ${o.on}`}
                            transition={{ type: "spring", stiffness: 500, damping: 34 }}
                          />
                        )}
                        <span className="relative">{o.label}</span>
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              disabled={locked}
              onClick={() => markAll(cls.id, "present")}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Mark everyone present
            </button>

            <AnimatePresence mode="wait" initial={false}>
              {locked ? (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 16 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white"
                  >
                    ✓
                  </motion.span>
                  <span className="text-sm font-semibold text-emerald-700">Submitted</span>
                  <button onClick={() => reopen(cls.id)} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                    Edit
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="submit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => submit(cls.id)}
                  className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
                >
                  Submit attendance
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </Reveal>
    </>
  );
}