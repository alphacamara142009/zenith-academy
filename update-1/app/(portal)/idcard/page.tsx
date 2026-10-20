"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { PageHeader, Reveal } from "@/components/ui";
import { student } from "@/lib/data";
import { useSchool } from "@/lib/school";

const HIDE = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as const;

export default function IdCardPage() {
  const { school } = useSchool();
  const [flipped, setFlipped] = useState(false);
  const idNumber = "ZA-2027-0148";

  return (
    <>
      <PageHeader title="ID Card" subtitle="Your digital student ID. Tap the card to flip it." />

      <Reveal delay={0.05}>
        <div className="mx-auto w-full max-w-sm" style={{ perspective: 1200 }}>
          <motion.div
            onClick={() => setFlipped((f) => !f)}
            animate={{ rotateY: flipped ? 180 : 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative aspect-[1.586/1] w-full cursor-pointer select-none"
          >
            <div
              style={HIDE}
              className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 p-6 text-white shadow-2xl shadow-brand-500/30"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-lg font-bold">{school.mark || "Z"}</div>
                <div>
                  <p className="font-bold leading-tight">{school.name}</p>
                  <p className="text-[11px] uppercase tracking-wider text-white/70">Student ID</p>
                </div>
              </div>
              <div className="relative mt-6 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold tracking-tight">{student.name}</p>
                  <p className="text-sm text-white/80">Grade 11 · 2026-27</p>
                  <p className="mt-3 font-mono text-sm tracking-widest text-white/90">{idNumber}</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold">{student.initials}</div>
              </div>
            </div>

            <div
              style={{ ...HIDE, transform: "rotateY(180deg)" }}
              className="absolute inset-0 flex items-center gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-400/20"
            >
              <div className="rounded-2xl bg-white p-1">
                <QRCodeSVG value={`ZENITH:${idNumber}`} size={116} />
              </div>
              <div>
                <p className="font-semibold">Scan me</p>
                <p className="mt-1 text-sm text-slate-500">Use this code at the library, lunch line, and school events.</p>
                <p className="mt-3 font-mono text-xs text-slate-400">{idNumber}</p>
              </div>
            </div>
          </motion.div>
        </div>
        <p className="mt-5 text-center text-sm text-slate-400">Demo card. Real ID codes are created by the school.</p>
      </Reveal>
    </>
  );
}
