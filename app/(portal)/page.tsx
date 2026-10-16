"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { Card, CountUp, PageHeader, ProgressRing, Reveal, ringColor } from "@/components/ui";
import { classes, gradeTone, letter, scores } from "@/lib/data";
import { parseKey } from "@/lib/calendar";

function GradesView() {
  const params = useSearchParams();
  const graded = classes.filter((c) => c.grade !== null);
  const overall = graded.reduce((s, c) => s + (c.grade as number), 0) / graded.length;

  const wanted = params?.get("class") ?? "";
  const [selId, setSelId] = useState(graded.some((c) => c.id === wanted) ? wanted : graded[0].id);
  const [whatIf, setWhatIf] = useState(90);

  const sel = graded.find((c) => c.id === selId) ?? graded[0];
  const selGrade = sel.grade as number;
  const list = scores[sel.id] ?? [];
  const earned = list.reduce((sum, s) => sum + s.earned, 0);
  const possible = list.reduce((sum, s) => sum + s.possible, 0);

  // Group scores by category (Quiz, Test, Lab...) to show strengths and weak spots.
  const groups: Record<string, { earned: number; possible: number }> = {};
  for (const s of list) {
    const g = groups[s.category] ?? { earned: 0, possible: 0 };
    g.earned += s.earned;
    g.possible += s.possible;
    groups[s.category] = g;
  }
  const cats = Object.entries(groups)
    .map(([name, g]) => ({ name, pct: (g.earned / g.possible) * 100 }))
    .sort((a, b) => b.pct - a.pct);
  const best = cats[0];
  const worst = cats[cats.length - 1];

  // "What if" calculator: how would the next 20-point quiz change this grade?
  const projected = ((earned + (20 * whatIf) / 100) / (possible + 20)) * 100;
  const diff = projected - selGrade;

  return (
    <>
      <PageHeader title="Grades" subtitle="Quarter 1 · Aug 19 - Oct 14" />

      <Reveal delay={0.03} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 p-6 text-white shadow-lg shadow-brand-500/20">
          <div>
            <p className="text-sm opacity-90">Overall grade</p>
            <p className="mt-1 text-5xl font-bold">
              <CountUp to={overall} decimals={1} suffix="%" />
            </p>
            <p className="mt-1 text-sm opacity-80">Across {graded.length} classes</p>
          </div>
          <ProgressRing value={overall} size={104} stroke={10} colorClass="text-white" trackClass="text-white/25" delay={0.15}>
            <span className="text-4xl font-bold">{letter(overall)}</span>
          </ProgressRing>
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
                          className="absolute inset-0 rounded-xl bg-brand-50"
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

        <motion.div key={sel.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Card lift={false}>
            <div className="flex flex-wrap items-center gap-5">
              <ProgressRing value={selGrade} size={112} stroke={10} colorClass={ringColor(selGrade)}>
                <div className="text-center">
                  <p className="text-2xl font-bold leading-none">{selGrade.toFixed(1)}%</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{letter(selGrade)}</p>
                </div>
              </ProgressRing>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold">{sel.name}</h2>
                <p className="text-sm text-slate-500">
                  {sel.teacher} · Room {sel.room}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  {earned} of {possible} points
                </p>
                {best && worst && best.name !== worst.name && (
                  <p className="mt-1 text-sm text-slate-600">
                    💪 Strongest: <span className="font-semibold">{best.name}</span> ({best.pct.toFixed(0)}%) · 🎯 Focus on:{" "}
                    <span className="font-semibold">{worst.name}</span> ({worst.pct.toFixed(0)}%)
                  </p>
                )}
              </div>
            </div>

            <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">By category</h3>
            <div className="space-y-2">
              {cats.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3 text-sm">
                  <span className="w-20 shrink-0 text-slate-600">{c.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <motion.div
                      className={`h-full rounded-full ${gradeTone(c.pct).bar}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-semibold">{c.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl bg-brand-50/60 p-4">
              <p className="text-sm font-semibold">What if...</p>
              <p className="text-sm text-slate-600">
                I score <span className="font-bold text-brand-700">{whatIf}%</span> on the next 20-point quiz?
              </p>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={whatIf}
                onChange={(e) => setWhatIf(Number(e.target.value))}
                aria-label="Score on the next quiz"
                className="mt-3 w-full accent-brand-500"
              />
              <p className="mt-2 text-sm">
                Your grade would be <span className="font-bold">{projected.toFixed(1)}%</span>{" "}
                <span className={`font-semibold ${diff >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  ({diff >= 0 ? "+" : ""}
                  {diff.toFixed(1)})
                </span>
              </p>
            </div>

            <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">All scores this quarter</h3>
            <ul className="divide-y divide-slate-100">
              {list.map((s, i) => {
                const p = (s.earned / s.possible) * 100;
                const t = gradeTone(p);
                return (
                  <motion.li
                    key={s.title}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.05 + i * 0.04 }}
                    className="flex items-center gap-3 py-3"
                  >
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
                  </motion.li>
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