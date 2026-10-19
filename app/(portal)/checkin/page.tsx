"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { fmtTime } from "@/lib/data";
import { ME } from "@/lib/demo";
import { BELL, codeFor, slotOf, useExtra } from "@/lib/extra";

export default function CheckIn() {
  const { checkins, checkIn } = useExtra();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [tries, setTries] = useState(0);
  const mine = checkins.find((c) => c.student === ME);

  function submit(value: string) {
    setResult(checkIn(ME, value.trim()));
    setTries((t) => t + 1);
  }

  return (
    <>
      <PageHeader title="Check-in" subtitle={`Arrived late? Mark yourself in. Before ${fmtTime(BELL)} counts as on time.`} />

      <AnimatePresence mode="wait" initial={false}>
        {mine ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Card lift={false}>
              <div className="flex flex-col items-center py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl text-white ${mine.status === "on time" ? "bg-emerald-500" : "bg-amber-500"}`}
                >
                  ✓
                </motion.div>
                <h2 className="mt-4 text-2xl font-bold">You are checked in</h2>
                <p className="text-slate-500">
                  {mine.time} ·{" "}
                  <span className={`font-semibold ${mine.status === "on time" ? "text-emerald-600" : "text-amber-600"}`}>{mine.status}</span>
                </p>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <Card lift={false}>
              <h2 className="font-semibold">Enter the code from the front desk</h2>
              <p className="text-sm text-slate-500">The 6-digit code on the screen changes every 30 seconds. On the phone app you will just scan its QR code.</p>

              <motion.div key={tries} animate={result && !result.ok ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.35 }}>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => e.key === "Enter" && submit(code)}
                  inputMode="numeric"
                  placeholder="000000"
                  aria-label="Check-in code"
                  className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-4 text-center text-3xl font-bold tracking-[0.4em] tabular-nums outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
                />
              </motion.div>

              <AnimatePresence>
                {result && !result.ok && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-3 text-sm font-medium text-rose-600">
                    {result.message}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="mt-5 flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={code.length !== 6}
                  onClick={() => submit(code)}
                  className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 disabled:opacity-40"
                >
                  Check in
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => submit(codeFor(slotOf(Date.now())))}
                  className="rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm font-medium text-slate-500 hover:border-brand-300 hover:text-brand-600"
                >
                  Demo: scan the front-desk QR
                </motion.button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Reveal delay={0.1} className="mt-4">
        <p className="text-center text-xs text-slate-400">The school can turn QR check-in off in Settings.</p>
      </Reveal>
    </>
  );
}