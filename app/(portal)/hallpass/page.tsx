"use client";

import { AnimatePresence, motion } from "motion/react";
import { Card, PageHeader, ProgressRing, Reveal } from "@/components/ui";
import { ME, REASONS, TEACHER, clock, useDemo, useTick } from "@/lib/demo";

const ICON: Record<string, string> = { Restroom: "🚻", Water: "💧", Nurse: "🩺", Office: "🏢", Locker: "🔒", Counselor: "💬" };
const CHIP: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  active: "bg-emerald-100 text-emerald-700",
  returned: "bg-slate-100 text-slate-600",
  denied: "bg-rose-100 text-rose-700",
};
const LIMIT = 10 * 60000;

export default function HallPass() {
  const { passes, requestPass, returnPass } = useDemo();
  const now = useTick();
  const mine = passes.filter((p) => p.student === ME);
  const current = mine.find((p) => p.status === "pending" || p.status === "active");
  const history = mine.filter((p) => p !== current);
  const elapsed = current?.startedAt ? now - current.startedAt : 0;
  const late = elapsed > LIMIT * 0.8;

  return (
    <>
      <PageHeader title="Hall Pass" subtitle="Ask for a pass without interrupting class." />

      <AnimatePresence mode="wait" initial={false}>
        {!current && (
          <motion.div key="ask" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <Card lift={false}>
              <h2 className="font-semibold">Where are you headed?</h2>
              <p className="text-sm text-slate-500">{TEACHER.name} gets your request right away.</p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {REASONS.map((r, i) => (
                  <motion.button
                    key={r}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => requestPass(ME, r)}
                    className="rounded-2xl border border-slate-200 bg-white p-4 text-center transition-colors hover:border-brand-300 hover:bg-brand-50"
                  >
                    <div className="text-3xl">{ICON[r]}</div>
                    <p className="mt-1 text-sm font-semibold">{r}</p>
                  </motion.button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {current?.status === "pending" && (
          <motion.div key="pending" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Card lift={false}>
              <div className="flex flex-col items-center py-6 text-center">
                <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-5xl">
                  {ICON[current.reason]}
                </motion.div>
                <h2 className="mt-4 text-xl font-bold">Waiting for {TEACHER.name}</h2>
                <p className="text-slate-500">Your {current.reason.toLowerCase()} pass request was sent.</p>
              </div>
            </Card>
          </motion.div>
        )}

        {current?.status === "active" && (
          <motion.div key="active" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Card lift={false}>
              <div className="flex flex-col items-center py-4 text-center">
                <p className="mb-3 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                  ✓ APPROVED · {ICON[current.reason]} {current.reason}
                </p>
                <ProgressRing
                  value={Math.min(100, (elapsed / LIMIT) * 100)}
                  size={150}
                  stroke={12}
                  colorClass={late ? "text-rose-500" : "text-emerald-500"}
                >
                  <div>
                    <p className="text-3xl font-bold tabular-nums">{clock(elapsed)}</p>
                    <p className="text-xs text-slate-500">of 10:00</p>
                  </div>
                </ProgressRing>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => returnPass(current.id)}
                  className="mt-5 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
                >
                  I'm back
                </motion.button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <Reveal delay={0.1} className="mt-6">
          <Card lift={false}>
            <h2 className="mb-2 font-semibold">Your recent passes</h2>
            <ul className="divide-y divide-slate-100">
              {history.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <span className="text-2xl">{ICON[p.reason]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.reason}</p>
                    <p className="text-sm text-slate-500">
                      {p.startedAt && p.endedAt ? `Out for ${clock(p.endedAt - p.startedAt)}` : p.status === "denied" ? "Not approved" : "In progress"}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${CHIP[p.status]}`}>{p.status}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      )}
    </>
  );
}