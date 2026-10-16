"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, PageHeader } from "@/components/ui";
import { TODAY, iso } from "@/lib/data";
import { allEvents, eventsOn, isNoSchool, parseKey } from "@/lib/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pill = (kind: string) => (kind === "off" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800");

export default function CalendarPage() {
  const todayKey = iso(TODAY);
  const [view, setView] = useState({ y: TODAY.getFullYear(), m: TODAY.getMonth() });
  const [selected, setSelected] = useState(todayKey);

  const first = new Date(view.y, view.m, 1);
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.y, view.m, d));
  while (cells.length % 7 !== 0) cells.push(null);

  let schoolDays = 0;
  let noSchoolDays = 0;
  cells.forEach((c) => {
    if (!c) return;
    const wd = c.getDay();
    if (wd === 0 || wd === 6) return;
    if (isNoSchool(iso(c))) noSchoolDays++;
    else schoolDays++;
  });

  function go(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  const monthLabel = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selDate = parseKey(selected);
  const selWeekend = selDate.getDay() === 0 || selDate.getDay() === 6;
  const selEvents = eventsOn(selected);

  const sorted = [...allEvents].sort((a, b) => a.date.localeCompare(b.date)).filter((e) => e.date >= todayKey);
  const upcoming = sorted.filter((e, i) => i === 0 || sorted[i - 1].title !== e.title).slice(0, 5);

  const navBtn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600 hover:bg-slate-50";

  return (
    <>
      <PageHeader title="Calendar" subtitle="School events, holidays, and no-school days." />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card lift={false}>
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => go(-1)} aria-label="Previous month" className={navBtn}>
              ‹
            </button>
            <h2 className="text-lg font-semibold">{monthLabel}</h2>
            <button onClick={() => go(1)} aria-label="Next month" className={navBtn}>
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          <motion.div
            key={`${view.y}-${view.m}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 grid grid-cols-7 gap-1"
          >
            {cells.map((c, i) => {
              if (!c) return <div key={`blank-${i}`} />;
              const key = iso(c);
              const evs = eventsOn(key);
              const weekend = c.getDay() === 0 || c.getDay() === 6;
              const isToday = key === todayKey;
              const isSel = key === selected;
              const off = evs.some((e) => e.kind === "off");
              const look = isSel
                ? "border-brand-400 bg-brand-50/60 ring-2 ring-brand-200"
                : weekend
                  ? "border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100"
                  : off
                    ? "border-amber-100 bg-amber-50/50 hover:shadow-sm"
                    : "border-slate-100 bg-white hover:border-brand-200 hover:shadow-sm";
              return (
                <button
                  key={key}
                  onClick={() => setSelected(key)}
                  className={`min-h-[72px] rounded-xl border p-1.5 text-left align-top transition ${look}`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white" : "text-slate-600"
                    }`}
                  >
                    {c.getDate()}
                  </span>
                  {evs.slice(0, 2).map((e) => (
                    <span key={e.title} className={`mt-1 block truncate rounded px-1 py-0.5 text-[10px] font-medium ${pill(e.kind)}`}>
                      {e.title}
                    </span>
                  ))}
                </button>
              );
            })}
          </motion.div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-sky-200" /> School event
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-amber-200" /> No school
            </span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card lift={false}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">This month</p>
            <div className="mt-3 flex gap-8">
              <div>
                <p className="text-3xl font-bold text-brand-600">{schoolDays}</p>
                <p className="text-xs text-slate-500">School days</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-500">{noSchoolDays}</p>
                <p className="text-xs text-slate-500">No-school days</p>
              </div>
            </div>
          </Card>

          <Card lift={false}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {selDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            {selEvents.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">{selWeekend ? "Weekend" : "Regular school day"}</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {selEvents.map((e) => (
                  <li key={e.title} className={`rounded-lg px-3 py-2 text-sm font-medium ${pill(e.kind)}`}>
                    {e.title}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card lift={false}>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Upcoming</p>
            <ul className="mt-3 space-y-3">
              {upcoming.map((e) => {
                const d = parseKey(e.date);
                return (
                  <li key={e.date + e.title} className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100">
                      <span className="text-[10px] font-semibold uppercase text-slate-500">
                        {d.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-sm font-bold leading-none">{d.getDate()}</span>
                    </div>
                    <p className="text-sm font-medium">{e.title}</p>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}