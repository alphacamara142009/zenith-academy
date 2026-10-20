"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { daysUntil, dueLabel, iso, TODAY } from "@/lib/data";
import { ROSTER } from "@/lib/demo";
import { useStored } from "@/lib/persist";
import { SEED_SLIPS, SLIPS_KEY, type Slip } from "@/lib/slips";

const inputCls =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export default function AdminSlipsPage() {
  const [slips, setSlips] = useStored<Slip[]>(SLIPS_KEY, SEED_SLIPS);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState(iso(TODAY));
  const [fee, setFee] = useState("Free");
  const [reminded, setReminded] = useState<number | null>(null);

  function create() {
    if (!title.trim()) return;
    setSlips((l) => [{ id: Date.now(), title: title.trim(), desc: desc.trim(), due, fee: fee.trim() || "Free", signedBy: [] }, ...l]);
    setTitle("");
    setDesc("");
    setFee("Free");
    setShowForm(false);
  }

  function remind(id: number) {
    setReminded(id);
    setTimeout(() => setReminded(null), 2500);
  }

  return (
    <>
      <PageHeader
        title="Permission slips"
        subtitle="Create slips and see which families still need to sign."
        right={
          <button onClick={() => setShowForm((v) => !v)} className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white">
            {showForm ? "Close" : "+ New slip"}
          </button>
        }
      />

      {showForm && (
        <Reveal className="mb-4">
          <Card lift={false}>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Slip title" className={`${inputCls} sm:col-span-2`} />
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="What are parents agreeing to?"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:col-span-2"
              />
              <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={inputCls} />
              <input value={fee} onChange={(e) => setFee(e.target.value)} placeholder="Cost (for example $12)" className={inputCls} />
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={create}
              disabled={!title.trim()}
              className="mt-3 h-10 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Send to families
            </motion.button>
          </Card>
        </Reveal>
      )}

      <div className="space-y-4">
        {slips.map((s, i) => {
          const signed = ROSTER.filter((n) => s.signedBy.includes(n));
          const missing = ROSTER.filter((n) => !s.signedBy.includes(n));
          const pct = Math.round((signed.length / ROSTER.length) * 100);
          return (
            <Reveal key={s.id} delay={0.04 * i}>
              <Card lift={false}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-xs text-slate-400">
                      Due {dueLabel(s.due)} · {daysUntil(s.due) < 0 ? "Past due" : `${daysUntil(s.due)} days left`} · {s.fee}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-brand-600">
                    {signed.length}
                    <span className="text-sm font-medium text-slate-400"> / {ROSTER.length} signed</span>
                  </p>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
                </div>

                {missing.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Still missing</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {missing.map((n) => (
                        <span key={n} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
                          {n}
                        </span>
                      ))}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => remind(s.id)}
                      className="mt-3 h-9 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      {reminded === s.id ? `✓ Reminder sent to ${missing.length} families` : `Remind ${missing.length} families`}
                    </motion.button>
                  </div>
                ) : (
                  <p className="mt-4 text-sm font-medium text-emerald-600">🎉 Every family has signed.</p>
                )}
              </Card>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
