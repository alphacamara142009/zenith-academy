"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Avatar, Card, PageHeader, ProgressRing, Reveal, ringColor } from "@/components/ui";
import { classes, gradeTone, letter, scores, type Score } from "@/lib/data";
import { ME, ROSTER, TEACHER } from "@/lib/demo";
import { useExtra } from "@/lib/extra";

// Made-up scores for the other students. Alex's row uses his real scores.
function synthetic(student: string, title: string, possible: number) {
  const h = [...(student + title)].reduce((s, c) => (s * 31 + c.charCodeAt(0)) % 997, 7);
  return Math.round(possible * (0.62 + (h % 38) / 100));
}

export default function Gradebook() {
  const { edits, setEdit } = useExtra();
  const mine = classes.filter((c) => TEACHER.classIds.includes(c.id));
  const [cid, setCid] = useState(mine[0].id);
  const cls = mine.find((c) => c.id === cid) ?? mine[0];
  const work: Score[] = scores[cls.id] ?? [];

  const keyOf = (student: string, w: Score) => `${cls.id}|${student}|${w.title}`;
  const valueOf = (student: string, w: Score) => edits[keyOf(student, w)] ?? (student === ME ? w.earned : synthetic(student, w.title, w.possible));

  const rows = ROSTER.map((name) => {
    const earned = work.reduce((s, w) => s + valueOf(name, w), 0);
    const possible = work.reduce((s, w) => s + w.possible, 0);
    return { name, pct: possible ? (earned / possible) * 100 : 0 };
  });
  const avg = rows.reduce((s, r) => s + r.pct, 0) / rows.length;
  const struggling = rows.filter((r) => r.pct < 70).sort((a, b) => a.pct - b.pct);
  const top = [...rows].sort((a, b) => b.pct - a.pct)[0];

  return (
    <>
      <PageHeader title="Gradebook" subtitle="Type a score and the averages update instantly." />

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
                  layoutId="gb-tab"
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{c.name}</span>
            </button>
          ))}
        </div>
      </Reveal>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <Reveal delay={0.06}>
          <Card lift={false}>
            <div className="flex items-center gap-4">
              <ProgressRing value={avg} size={76} stroke={8} colorClass={ringColor(avg)}>
                <span className="text-sm font-bold">{avg.toFixed(0)}%</span>
              </ProgressRing>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Class average</p>
                <p className="text-2xl font-bold">{letter(avg)}</p>
              </div>
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.1}>
          <Card lift={false}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Needs attention</p>
            {struggling.length === 0 ? (
              <p className="mt-2 text-sm text-emerald-600">Everyone is at 70% or higher 🎉</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {struggling.slice(0, 3).map((r) => (
                  <li key={r.name} className="flex justify-between">
                    <span>{r.name}</span>
                    <span className="font-semibold text-rose-600">{r.pct.toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </Reveal>
        <Reveal delay={0.14}>
          <Card lift={false}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Top performer</p>
            <div className="mt-2 flex items-center gap-3">
              <Avatar name={top.name} />
              <div>
                <p className="font-semibold">{top.name}</p>
                <p className="text-sm text-emerald-600">{top.pct.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.18}>
        <Card lift={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-3 font-semibold">Student</th>
                  {work.map((w) => (
                    <th key={w.title} className="px-1 pb-3 text-center font-semibold">
                      <span className="block max-w-[96px] truncate normal-case">{w.title}</span>
                      <span className="block text-[10px] font-normal normal-case">out of {w.possible}</span>
                    </th>
                  ))}
                  <th className="pb-3 pl-3 text-right font-semibold">Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => {
                  const t = gradeTone(r.pct);
                  return (
                    <tr key={r.name}>
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <Avatar name={r.name} size={30} />
                          <span className="font-medium">{r.name}</span>
                        </div>
                      </td>
                      {work.map((w) => (
                        <td key={w.title} className="px-1 py-2 text-center">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={0}
                            max={w.possible}
                            value={valueOf(r.name, w)}
                            onChange={(e) => setEdit(keyOf(r.name, w), Math.max(0, Math.min(w.possible, Number(e.target.value) || 0)))}
                            aria-label={`${r.name}, ${w.title}`}
                            className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center tabular-nums outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                          />
                        </td>
                      ))}
                      <td className="py-2 pl-3 text-right">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${t.chip}`}>
                          {r.pct.toFixed(1)}% · {letter(r.pct)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>
    </>
  );
}