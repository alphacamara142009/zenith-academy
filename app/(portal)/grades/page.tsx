"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Card, CountUp, PageHeader, Reveal } from "@/components/ui";
import { classes, gradeTone, letter, scores } from "@/lib/data";
import { parseKey } from "@/lib/calendar";

function GradesView() {
  const params = useSearchParams();
  const graded = classes.filter((c) => c.grade !== null);
  const overall = graded.reduce((s, c) => s + (c.grade as number), 0) / graded.length;

  const wanted = params?.get("class") ?? "";
  const [selId, setSelId] = useState(graded.some((c) => c.id === wanted) ? wanted : graded[0].id);

  const sel = graded.find((c) => c.id === selId) ?? graded[0];
  const selGrade = sel.grade as number;
  const selTone = gradeTone(selGrade);
  const list = scores[sel.id] ?? [];
  const earned = list.reduce((sum, s) => sum + s.earned, 0);
  const possible = list.reduce((sum, s) => sum + s.possible, 0);

  return (
    <>
      <PageHeader title="Grades" subtitle="Quarter 1 · Aug 19 - Oct 14" />

      <Reveal delay={0.03} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 p-6 text-white shadow-lg">
          <div>
            <p className="text-sm opacity-90">Overall grade</p>
            <p className="mt-1 text-5xl font-bold">
              <CountUp to={overall} decimals={1} suffix="%" />
            </p>
            <p className="mt-1 text-sm opacity-80">Across {graded.length} classes</p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 text-4xl font-bold">{letter(overall)}</div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Reveal delay={0.08}>
          <Card lift={false}>
            <h2 className="mb-3 font-semibold">Your classes</h2>
            <ul className="space-y-1">
              {graded.map((c) => {
                const g = c.grade as number;
                const t = gradeTone(g);
                const active = c.id === sel.id;
                return (
                  <li key={c.id}>
                    <button
                      onClick={() => setSelId(c.id)}
                      aria-pressed={active}
                      className="relative w-full rounded-xl px-3 py-3 text-left hover:bg-slate-50"
                    >
                      {active && (
                        <motion.span
                          layoutId="grade-pill"
                          className="absolute inset-0 rounded-xl bg-indigo-50"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <div className="relative flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.teacher}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${t.chip}`}>
                          {g.toFixed(1)}% · {letter(g)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>

        <motion.div key={sel.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Card lift={false}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{sel.name}</h2>
                <p className="text-sm text-slate-500">
                  {sel.teacher} · Room {sel.room}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{selGrade.toFixed(1)}%</p>
                <span className={`rounded-full px-3 py-1 text-sm font-bold ${selTone.chip}`}>{letter(selGrade)}</span>
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className={`h-full rounded-full ${selTone.bar}`}
                initial={{ width: 0 }}
                animate={{ width: `${selGrade}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {earned} of {possible} points
            </p>

            <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">All scores this quarter</h3>
            <ul className="divide-y divide-slate-100">
              {list.map((s) => {
                const p = (s.earned / s.possible) * 100;
                const t = gradeTone(p);
                return (
                  <li key={s.title} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{s.title}</p>
                      <p className="text-sm text-slate-500">
                        {s.category} · {parseKey(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <p className="text-sm text-slate-500">
                      {s.earned}/{s.possible}
                    </p>
                    <span className={`w-16 rounded-full px-3 py-1 text-center text-xs font-bold ${t.chip}`}>{p.toFixed(0)}%</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

export default function Grades() {
  return (
    <Suspense fallback={null}>
      <GradesView />
    </Suspense>
  );
}