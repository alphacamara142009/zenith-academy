"use client";

import { QRCodeSVG } from "qrcode.react";
import { motion } from "motion/react";
import { Card, PageHeader, ProgressRing, Reveal } from "@/components/ui";
import { fmtTime } from "@/lib/data";
import { useTick } from "@/lib/demo";
import { BELL, CODE_MS, codeFor, slotOf, useExtra } from "@/lib/extra";
import { useSchool } from "@/lib/school";

const CLOCKS: { label: string; value: number | null }[] = [
  { label: "Real time", value: null },
  { label: "8:30 AM", value: 8 * 60 + 30 },
  { label: "8:55 AM", value: 8 * 60 + 55 },
  { label: "9:30 AM", value: 9 * 60 + 30 },
];

export default function Kiosk() {
  const { school } = useSchool();
  const { checkins, clockOverride, setClockOverride, clearCheckins } = useExtra();
  const now = useTick(500);

  const code = codeFor(slotOf(now));
  const left = CODE_MS - (now % CODE_MS);

  return (
    <>
      <PageHeader title="Check-in Kiosk" subtitle="Show this screen at the front desk. The code changes every 30 seconds." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.04}>
          <Card lift={false}>
            <div className="flex flex-col items-center py-4 text-center">
              <p className="text-sm font-semibold text-slate-500">{school.name} · Late arrival check-in</p>
              <div className="mt-4 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-100">
                <QRCodeSVG value={`CHECKIN:${code}`} size={220} level="M" />
              </div>
              <p className="mt-5 text-5xl font-bold tracking-[0.3em] tabular-nums">{code}</p>
              <div className="mt-4 flex items-center gap-3">
                <ProgressRing value={(left / CODE_MS) * 100} size={44} stroke={5} trackClass="text-slate-100" colorClass={left < 8000 ? "text-rose-500" : "text-brand-500"}>
                  <span className="text-xs font-bold tabular-nums">{Math.ceil(left / 1000)}</span>
                </ProgressRing>
                <p className="text-sm text-slate-500">seconds until the next code</p>
              </div>
            </div>
          </Card>
        </Reveal>

        <div className="space-y-6">
          <Reveal delay={0.08}>
            <Card lift={false}>
              <h2 className="font-semibold">Demo clock</h2>
              <p className="text-sm text-slate-500">Pretend it is a different time to see on time versus tardy. The bell rings at {fmtTime(BELL)}.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CLOCKS.map((c) => {
                  const on = clockOverride === c.value;
                  return (
                    <motion.button
                      key={c.label}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => setClockOverride(c.value)}
                      aria-pressed={on}
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                        on ? "border-brand-400 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {c.label}
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.12}>
            <Card lift={false}>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Checked in today</h2>
                <button onClick={clearCheckins} className="text-sm font-medium text-slate-400 hover:text-slate-700">
                  Reset demo
                </button>
              </div>
              <ul className="mt-2 divide-y divide-slate-100">
                {checkins.map((c) => (
                  <motion.li key={c.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.student}</p>
                      <p className="text-sm text-slate-500">{c.time}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${c.status === "on time" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {c.status}
                    </span>
                  </motion.li>
                ))}
                {checkins.length === 0 && <li className="py-6 text-center text-sm text-slate-400">No one has checked in yet.</li>}
              </ul>
            </Card>
          </Reveal>
        </div>
      </div>
    </>
  );
}