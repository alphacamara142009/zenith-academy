"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, PageHeader, ProgressRing, Reveal } from "@/components/ui";
import { assignments, classes, daysUntil, dueLabel, iso, TODAY } from "@/lib/data";
import { useStored } from "@/lib/persist";

type Task = { id: number; classId: string; title: string; due: string };
type Filter = "todo" | "done" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todo", label: "To do" },
  { key: "done", label: "Done" },
  { key: "all", label: "All" },
];

const inputCls =
  "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export default function PlannerPage() {
  const [done, setDone] = useStored<number[]>("zenith-planner-done", []);
  const [mine, setMine] = useStored<Task[]>("zenith-planner-mine", []);
  const [filter, setFilter] = useState<Filter>("todo");
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("alg");
  const [due, setDue] = useState(iso(TODAY));

  const all: Task[] = [...assignments, ...mine].sort((a, b) => a.due.localeCompare(b.due));
  const isDone = (id: number) => done.includes(id);
  const doneCount = all.filter((t) => isDone(t.id)).length;
  const pct = all.length ? Math.round((doneCount / all.length) * 100) : 0;
  const open = all.filter((t) => !isDone(t.id));
  const overdue = open.filter((t) => daysUntil(t.due) < 0).length;
  const today = open.filter((t) => daysUntil(t.due) === 0).length;
  const list = all.filter((t) => (filter === "all" ? true : filter === "done" ? isDone(t.id) : !isDone(t.id)));

  const toggle = (id: number) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));

  function addTask() {
    if (!title.trim()) return;
    setMine((m) => [...m, { id: Date.now(), classId, title: title.trim(), due }]);
    setTitle("");
  }

  return (
    <>
      <PageHeader title="Planner" subtitle="Check off your work and add your own tasks." />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Reveal delay={0.05}>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <motion.button
                  key={f.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filter === f.key ? "bg-brand-600 text-white shadow-md shadow-brand-500/25" : "bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {f.label}
                </motion.button>
              ))}
            </div>
          </Reveal>

          <Card lift={false} className="!p-2">
            {list.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-4xl">{filter === "done" ? "📭" : "🎉"}</p>
                <p className="mt-2 font-semibold">{filter === "done" ? "Nothing checked off yet" : "You are all caught up!"}</p>
                <p className="text-sm text-slate-500">{filter === "done" ? "Finish a task and it shows up here." : "No work waiting for you."}</p>
              </div>
            ) : (
              <ul>
                <AnimatePresence initial={false}>
                  {list.map((t) => {
                    const cls = classes.find((c) => c.id === t.classId);
                    const n = daysUntil(t.due);
                    const finished = isDone(t.id);
                    const chip = finished
                      ? "bg-slate-100 text-slate-400"
                      : n < 0
                        ? "bg-rose-100 text-rose-700"
                        : n === 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600";
                    const isMine = mine.some((m) => m.id === t.id);
                    return (
                      <motion.li
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-3 rounded-xl p-3 hover:bg-slate-50"
                      >
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => toggle(t.id)}
                          aria-label={finished ? "Mark as not done" : "Mark as done"}
                          aria-pressed={finished}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                            finished ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 bg-white hover:border-brand-400"
                          }`}
                        >
                          {finished && (
                            <motion.svg initial={{ scale: 0 }} animate={{ scale: 1 }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12l5 5 9-10" />
                            </motion.svg>
                          )}
                        </motion.button>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate font-medium ${finished ? "text-slate-400 line-through" : ""}`}>{t.title}</p>
                          <p className="text-xs text-slate-400">{cls?.name ?? "Class"}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${chip}`}>{finished ? "Done" : dueLabel(t.due)}</span>
                        {isMine && (
                          <button
                            onClick={() => setMine((m) => m.filter((x) => x.id !== t.id))}
                            aria-label="Delete task"
                            className="rounded-lg px-2 py-1 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-500"
                          >
                            ✕
                          </button>
                        )}
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Reveal delay={0.08}>
            <Card lift={false}>
              <div className="flex items-center gap-4">
                <ProgressRing value={pct} size={84} stroke={8} colorClass="text-emerald-500">
                  <span className="text-lg font-bold">{pct}%</span>
                </ProgressRing>
                <div>
                  <p className="font-semibold">
                    {doneCount} of {all.length} done
                  </p>
                  <p className="text-xs text-slate-500">
                    {overdue > 0 ? `${overdue} overdue` : today > 0 ? `${today} due today` : "Nothing urgent"}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.11}>
            <Card lift={false}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Add your own task</p>
              <div className="mt-3 space-y-2">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Study for the quiz"
                  className={`${inputCls} w-full`}
                />
                <select value={classId} onChange={(e) => setClassId(e.target.value)} className={`${inputCls} w-full`}>
                  {classes
                    .filter((c) => c.id !== "home")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${inputCls} w-full`} />
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={addTask}
                  disabled={!title.trim()}
                  className="h-10 w-full rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-md shadow-brand-500/25 transition-opacity disabled:opacity-40"
                >
                  Add task
                </motion.button>
              </div>
            </Card>
          </Reveal>
        </div>
      </div>
    </>
  );
}
