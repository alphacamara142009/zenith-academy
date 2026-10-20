"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Card, Reveal } from "@/components/ui";

const STOPS = [
  { name: "Oak Ridge Dr", x: 30, y: 165, anchor: "middle" },
  { name: "Willow Ct", x: 95, y: 112, anchor: "middle" },
  { name: "Maple & 5th", x: 160, y: 128, anchor: "middle" },
  { name: "Cedar Park", x: 225, y: 66, anchor: "middle" },
  { name: "Zenith Academy", x: 296, y: 40, anchor: "end" },
] as const;

const MY_STOP = 2;
const TRIP_MIN = 18; // minutes for the whole route
const POINTS = STOPS.map((s) => `${s.x},${s.y}`).join(" ");

const LENS = STOPS.slice(1).map((s, i) => Math.hypot(s.x - STOPS[i].x, s.y - STOPS[i].y));
const TOTAL = LENS.reduce((a, b) => a + b, 0);
const STOP_AT = STOPS.map((_, i) => LENS.slice(0, i).reduce((a, b) => a + b, 0) / TOTAL);

function at(p: number) {
  let d = p * TOTAL;
  for (let i = 0; i < LENS.length; i++) {
    if (d <= LENS[i] || i === LENS.length - 1) {
      const t = Math.min(1, d / LENS[i]);
      return { x: STOPS[i].x + (STOPS[i + 1].x - STOPS[i].x) * t, y: STOPS[i].y + (STOPS[i + 1].y - STOPS[i].y) * t };
    }
    d -= LENS[i];
  }
  return { x: STOPS[0].x, y: STOPS[0].y };
}

export function BusTracker({ who }: { who: string }) {
  const [p, setP] = useState(0.06);

  // Demo only. A real version gets the bus position from the bus company.
  useEffect(() => {
    const t = setInterval(() => setP((v) => (v >= 1 ? 0 : Math.min(1, v + 0.0011))), 100);
    return () => clearInterval(t);
  }, []);

  const pos = at(p);
  const mins = Math.max(0, Math.ceil((STOP_AT[MY_STOP] - p) * TRIP_MIN));
  const status =
    p >= 0.995 ? "Arrived at school" : p >= STOP_AT[MY_STOP] ? `${who} was picked up and is heading to school` : mins <= 1 ? "Arriving now" : `Arrives in ${mins} min`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Reveal delay={0.05}>
        <Card lift={false} className="!p-3">
          <svg viewBox="0 0 320 200" className="w-full rounded-xl bg-emerald-50/60" role="img" aria-label="Map of the bus route">
            <polyline points={POINTS} fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={POINTS} fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline
              points={POINTS}
              pathLength={1}
              fill="none"
              stroke="var(--brand-500)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${p} 2`}
              opacity="0.85"
            />
            {STOPS.map((s, i) => (
              <g key={s.name}>
                <circle cx={s.x} cy={s.y} r={i === MY_STOP ? 7 : 5} fill="white" stroke={i === MY_STOP ? "var(--brand-600)" : "#94a3b8"} strokeWidth={i === MY_STOP ? 3 : 2} />
                <text x={s.x + (s.anchor === "end" ? 8 : 0)} y={s.y + 18} textAnchor={s.anchor} fontSize="8.5" fontWeight={i === MY_STOP ? 700 : 500} className="fill-slate-600">
                  {i === MY_STOP ? `${s.name} (your stop)` : s.name}
                </text>
              </g>
            ))}
            <g transform={`translate(${pos.x} ${pos.y})`}>
              <motion.circle
                r={8}
                fill="var(--brand-500)"
                animate={{ r: [8, 20], opacity: [0.4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              />
              <circle r={10} fill="white" stroke="var(--brand-600)" strokeWidth="2" />
              <text y="4" textAnchor="middle" fontSize="12">
                🚌
              </text>
            </g>
          </svg>
          <p className="mt-2 text-center text-xs text-slate-400">Demo simulation. A real tracker uses the bus GPS.</p>
        </Card>
      </Reveal>

      <div className="space-y-4">
        <Reveal delay={0.08}>
          <Card lift={false}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bus 14 · Morning route</p>
            <p className="mt-2 text-2xl font-bold text-brand-600">{status}</p>
            <p className="mt-1 text-sm text-slate-500">Driver: Ms. Dawson</p>
          </Card>
        </Reveal>

        <Reveal delay={0.11}>
          <Card lift={false}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stops</p>
            <ul className="mt-3 space-y-3">
              {STOPS.map((s, i) => {
                const passed = p >= STOP_AT[i] && i !== STOPS.length - 1 ? true : p >= 0.995;
                return (
                  <li key={s.name} className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        passed ? "bg-emerald-500 text-white" : i === MY_STOP ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {passed ? "✓" : i + 1}
                    </span>
                    <span className={`text-sm ${i === MY_STOP ? "font-semibold" : ""} ${passed ? "text-slate-400" : ""}`}>{s.name}</span>
                  </li>
                );
              })}
            </ul>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
