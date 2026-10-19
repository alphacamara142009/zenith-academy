"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { TODAY, iso, student } from "@/lib/data";
import { parseKey } from "@/lib/calendar";
import { useExtra } from "@/lib/extra";

const REASONS = ["Sick", "Medical appointment", "Family matter", "Other"];
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export default function ReportAbsence() {
  const { absences, reportAbsence, removeAbsence } = useExtra();
  const [date, setDate] = useState(iso(TODAY));
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  function submit() {
    if (!date) return;
    reportAbsence(date, reason, note.trim());
    setNote("");
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  }

  return (
    <>
      <PageHeader title="Report an absence" subtitle={`Let the school know ${student.first} will be out.`} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.04}>
          <Card lift={false}>
            <h2 className="font-semibold">New report</h2>

            <label htmlFor="abs-date" className="mt-4 block text-sm font-medium">
              Date
            </label>
            <input id="abs-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />

            <label htmlFor="abs-reason" className="mt-4 block text-sm font-medium">
              Reason
            </label>
            <select id="abs-reason" value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass}>
              {REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>

            <label htmlFor="abs-note" className="mt-4 block text-sm font-medium">
              Note for the office (optional)
            </label>
            <textarea id="abs-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />

            <div className="mt-5 flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={submit}
                className="rounded-xl bg-brand-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700"
              >
                Send report
              </motion.button>
              <AnimatePresence>
                {sent && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-semibold text-emerald-600"
                  >
                    ✓ Sent to the office
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card lift={false}>
            <h2 className="mb-1 font-semibold">Your reports</h2>
            <ul className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {absences.map((a) => (
                  <motion.li
                    key={a.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-3 py-3"
                  >
                    <span className="text-xl">📝</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{parseKey(a.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
                      <p className="text-sm text-slate-500">
                        {a.reason}
                        {a.note ? ` · ${a.note}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAbsence(a.id)}
                      aria-label="Remove report"
                      className="rounded-lg px-2 py-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
              {absences.length === 0 && <li className="py-8 text-center text-sm text-slate-400">No reports yet.</li>}
            </ul>
          </Card>
        </Reveal>
      </div>
    </>
  );
}