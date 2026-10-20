"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { daysUntil, dueLabel } from "@/lib/data";
import { ME } from "@/lib/demo";
import { useStored } from "@/lib/persist";
import { SEED_SLIPS, SLIPS_KEY, type Slip } from "@/lib/slips";

export default function ParentSlipsPage() {
  const [slips, setSlips] = useStored<Slip[]>(SLIPS_KEY, SEED_SLIPS);
  const [signing, setSigning] = useState<number | null>(null);
  const [sig, setSig] = useState("");

  const waiting = slips.filter((s) => !s.signedBy.includes(ME));

  function sign(id: number) {
    setSlips((list) => list.map((s) => (s.id === id ? { ...s, signedBy: [...s.signedBy, ME] } : s)));
    setSigning(null);
    setSig("");
  }

  return (
    <>
      <PageHeader
        title="Permission slips"
        subtitle={waiting.length > 0 ? `${waiting.length} waiting for your signature.` : "Everything is signed. Thank you!"}
      />

      <div className="space-y-4">
        {slips.map((s, i) => {
          const signed = s.signedBy.includes(ME);
          const n = daysUntil(s.due);
          return (
            <Reveal key={s.id} delay={0.04 * i}>
              <Card lift={false}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Cost: {s.fee} · {signed ? "Signed for Alex" : `Due ${dueLabel(s.due)}`}
                    </p>
                  </div>
                  {signed ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">✓ Signed</span>
                  ) : (
                    <span className={`rounded-full px-3 py-1 text-sm font-semibold ${n <= 7 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                      {n <= 7 ? "Due soon" : "Needs signature"}
                    </span>
                  )}
                </div>

                {!signed && (
                  <div className="mt-4">
                    <AnimatePresence mode="wait" initial={false}>
                      {signing === s.id ? (
                        <motion.div
                          key="form"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-sm text-slate-500">Type your full name to sign for Alex.</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <input
                              autoFocus
                              value={sig}
                              onChange={(e) => setSig(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && sig.trim().length > 2 && sign(s.id)}
                              placeholder="Your full name"
                              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 font-serif text-lg italic outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                            />
                            <motion.button
                              whileTap={{ scale: 0.96 }}
                              onClick={() => sign(s.id)}
                              disabled={sig.trim().length < 3}
                              className="h-10 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 disabled:opacity-40"
                            >
                              Sign
                            </motion.button>
                            <button onClick={() => setSigning(null)} className="h-10 rounded-xl px-3 text-sm text-slate-500 hover:bg-slate-100">
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="btn"
                          whileTap={{ scale: 0.97 }}
                          onClick={() => {
                            setSigning(s.id);
                            setSig("");
                          }}
                          className="h-10 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-md shadow-brand-500/25"
                        >
                          Review and sign
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </Card>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
