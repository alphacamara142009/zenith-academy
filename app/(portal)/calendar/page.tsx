"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { TODAY, daysUntil, iso } from "@/lib/data";
import { KINDS, allEvents, eventsOn, isNoSchool, parseKey, type Kind } from "@/lib/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KIND_KEYS = Object.keys(KINDS) as Kind[];
const navBtn =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600 transition-colors hover:bg-slate-50";

function when(n: number) {
  return n === 0 ? "Today" : n === 1 ? "Tomorrow" : n < 0 ? `${-n} days ago` : `in ${n} days`;
}

export default function CalendarPage() {
  const todayKey = iso(TODAY);
  const [view, setView] = useState({ y: TODAY.getFullYear(), m: TODAY.getMonth() });
  const [dir, setDir] = useState(1);
  const [selected, setSelected] = useState(todayKey);
  const [hidden, setHidden] = useState<Kind[]>([]);

  const shown = (k: Kind) => !hidden.includes(k);
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

  const prefix = `${view.y}-${String(view.m + 1).padStart(2, "0")}`;
  const monthEvents = allEvents.filter((e) => e.date.startsWith(prefix));
  const countKind = (k: Kind) => new Set(monthEvents.filter((e) => e.kind === k).map((e) => e.title)).size;

  function go(delta: number) {
    setDir(delta > 0 ? 1 : -1);
    setView((v) => {
      const d = new Date(v.y, v.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  }

  function goToday() {
    setDir(TODAY.getFullYear() * 12 + TODAY.getMonth() >= view.y * 12 + view.m ? 1 : -1);
    setView({ y: TODAY.getFullYear(), m: TODAY.getMonth() });
    setSelected(todayKey);
  }

  const toggle = (k: Kind) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]));

  const monthLabel = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selDate = parseKey(selected);
  const selWeekend = selDate.getDay() === 0 || selDate.getDay() === 6;
  const selEvents = eventsOn(selected).filter((e) => shown(e.kind));

  const nextOff = allEvents.find((e) => e.kind === "off" && e.date >= todayKey);
  const future = allEvents.filter((e) => e.date >= todayKey && shown(e.kind));
  const upcoming = future.filter((e, i) => i === 0 || future[i - 1].title !== e.title).slice(0, 6);

  return (
    <>
      <PageHeader
        title="Calendar"
        subtitle="School events, sports, exams, and no-school days."
        right={
          <button
            onClick={goToday}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Today
          </button>
        }
      />

      {nextOff && (
        <Reveal delay={0.03} className="mb-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-4 text-white shadow-lg shadow-amber-500/20">
            <span className="text-3xl">🏖️</span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Next day off</p>
              <p className="font-semibold">{nextOff.title}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold leading-none">{daysUntil(nextOff.date)}</p>
              <p className="text-xs text-white/80">{daysUntil(nextOff.date) === 1 ? "day to go" : "days to go"}</p>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal delay={0.06} className="mb-4">
        <div className="flex flex-wrap gap-2">
          {KIND_KEYS.map((k) => {
            const on = shown(k);
            return (
              <motion.button
                key={k}
                whileTap={{ scale: 0.94 }}
                onClick={() => toggle(k)}
                aria-pressed={on}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  on ? "border-slate-200 bg-white text-slate-700" : "border-transparent bg-slate-100 text-slate-400 line-through"
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${KINDS[k].dot} ${on ? "" : "opacity-40"}`} />
                {KINDS[k].label}
                <span className="text-xs text-slate-400">{countKind(k)}</span>
              </motion.button>
            );
          })}
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Reveal delay={0.09}>
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
              initial={{ opacity: 0, x: dir * 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-1 grid grid-cols-7 gap-1"
            >
              {cells.map((c, i) => {
                if (!c) return <div key={`blank-${i}`} />;
                const key = iso(c);
                const evs = eventsOn(key).filter((e) => shown(e.kind));
                const weekend = c.getDay() === 0 || c.getDay() === 6;
                const isToday = key === todayKey;
                const isSel = key === selected;
                const off = evs.some((e) => e.kind === "off");
                const past = key < todayKey;
                const look = isSel
                  ? "border-brand-400 bg-brand-50/70 ring-2 ring-brand-200"
                  : weekend
                    ? "border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100"
                    : off
                      ? "border-amber-100 bg-amber-50/60 hover:border-amber-200"
                      : "border-slate-100 bg-white hover:border-brand-200 hover:shadow-sm";
                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelected(key)}
                    className={`min-h-[84px] rounded-xl border p-1.5 text-left align-top transition-colors ${look} ${past && !isSel ? "opacity-60" : ""}`}
                  >
                    <span
                      className={`text-xs font-semibold ${
                        isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white" : "text-slate-600"
                      }`}
                    >
                      {c.getDate()}
                    </span>
                    {evs.slice(0, 2).map((e) => (
                      <span key={e.title} className={`mt-1 hidden truncate rounded px-1 py-0.5 text-[10px] font-medium sm:block ${KINDS[e.kind].pill}`}>
                        {e.title}
                      </span>
                    ))}
                    {evs.length > 2 && <span className="mt-0.5 hidden text-[10px] text-slate-400 sm:block">+{evs.length - 2} more</span>}
                    {evs.length > 0 && (
                      <span className="mt-1 flex gap-0.5 sm:hidden">
                        {evs.slice(0, 3).map((e) => (
                          <span key={e.title} className={`h-1.5 w-1.5 rounded-full ${KINDS[e.kind].dot}`} />
                        ))}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </Card>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={0.12}>
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
                <div>
                  <p className="text-3xl font-bold text-emerald-500">{new Set(monthEvents.map((e) => e.title)).size}</p>
                  <p className="text-xs text-slate-500">Events</p>
                </div>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.15}>
            <Card lift={false}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {selDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <p className="text-xs text-slate-400">{when(daysUntil(selected))}</p>
              <motion.div key={selected} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                {selEvents.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">{selWeekend ? "Weekend 😎" : "Regular school day"}</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {selEvents.map((e) => (
                      <li key={e.title} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${KINDS[e.kind].pill}`}>
                        <span>{KINDS[e.kind].icon}</span>
                        {e.title}
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </Card>
          </Reveal>

          <Reveal delay={0.18}>
            <Card lift={false}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Coming up</p>
              <ul className="mt-3 space-y-3">
                {upcoming.map((e) => {
                  const d = parseKey(e.date);
                  return (
                    <li key={e.date + e.title} className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-100">
                        <span className="text-[10px] font-semibold uppercase text-slate-500">{d.toLocaleDateString("en-US", { month: "short" })}</span>
                        <span className="text-sm font-bold leading-none">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="text-xs text-slate-400">{when(daysUntil(e.date))}</p>
                      </div>
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${KINDS[e.kind].dot}`} />
                    </li>
                  );
                })}
              </ul>
            </Card>
          </Reveal>
        </div>
      </div>
    </>
  );
}