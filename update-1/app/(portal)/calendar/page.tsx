"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { TODAY, daysUntil, iso } from "@/lib/data";
import { KINDS, allEvents, eventsOn, isNoSchool, parseKey, type CalendarEvent, type Kind } from "@/lib/calendar";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const KIND_KEYS = Object.keys(KINDS) as Kind[];
const navBtn =
  "flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg text-white transition-colors hover:bg-white/30 active:scale-95";

// Each month gets its own color and icon so the page feels alive.
const THEMES = [
  { grad: "from-sky-500 to-indigo-500", icon: "❄️" },
  { grad: "from-rose-400 to-pink-500", icon: "💝" },
  { grad: "from-emerald-400 to-teal-500", icon: "🌱" },
  { grad: "from-lime-500 to-emerald-500", icon: "🌷" },
  { grad: "from-pink-400 to-fuchsia-500", icon: "🌸" },
  { grad: "from-amber-400 to-orange-500", icon: "☀️" },
  { grad: "from-orange-400 to-red-500", icon: "🎆" },
  { grad: "from-yellow-400 to-orange-500", icon: "🎒" },
  { grad: "from-amber-500 to-red-500", icon: "🍂" },
  { grad: "from-orange-500 to-purple-600", icon: "🎃" },
  { grad: "from-amber-600 to-rose-600", icon: "🦃" },
  { grad: "from-sky-400 to-blue-600", icon: "⛄" },
];

function when(n: number) {
  return n === 0 ? "Today" : n === 1 ? "Tomorrow" : n < 0 ? `${-n} days ago` : `in ${n} days`;
}

// Downloads one event so it can be added to Google, Apple, or Outlook calendars.
function downloadIcs(e: CalendarEvent) {
  const d = parseKey(e.date);
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const f = (x: Date) => iso(x).replace(/-/g, "");
  const text = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//School Portal//EN",
    "BEGIN:VEVENT",
    `UID:${f(d)}-${e.title.replace(/\W/g, "")}@school-portal`,
    `DTSTAMP:${f(d)}T000000Z`,
    `DTSTART;VALUE=DATE:${f(d)}`,
    `DTEND;VALUE=DATE:${f(next)}`,
    `SUMMARY:${e.title}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([text], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${e.title.replace(/\W+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CalendarPage() {
  const todayKey = iso(TODAY);
  const [view, setView] = useState({ y: TODAY.getFullYear(), m: TODAY.getMonth() });
  const [dir, setDir] = useState(1);
  const [selected, setSelected] = useState(todayKey);
  const [hidden, setHidden] = useState<Kind[]>([]);
  const [mode, setMode] = useState<"month" | "agenda">("month");

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
  const theme = THEMES[view.m];

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

  // Keyboard shortcut: left and right arrow keys change the month.
  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      const t = ev.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT") return;
      if (ev.key === "ArrowLeft") go(-1);
      if (ev.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (k: Kind) => setHidden((h) => (h.includes(k) ? h.filter((x) => x !== k) : [...h, k]));

  const monthLabel = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selDate = parseKey(selected);
  const selWeekend = selDate.getDay() === 0 || selDate.getDay() === 6;
  const selEvents = eventsOn(selected).filter((e) => shown(e.kind));

  const nextOff = allEvents.find((e) => e.kind === "off" && e.date >= todayKey);
  const future = allEvents.filter((e) => e.date >= todayKey && shown(e.kind));
  const upcoming = future.filter((e, i) => i === 0 || future[i - 1].title !== e.title).slice(0, 6);

  const agenda = monthEvents.filter((e) => shown(e.kind)).filter((e, i, arr) => i === 0 || arr[i - 1].title !== e.title);

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
        <div className="flex flex-wrap items-center justify-between gap-3">
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

          <div className="relative flex rounded-full bg-slate-100 p-1">
            {(["month", "agenda"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${mode === m ? "text-brand-700" : "text-slate-500"}`}
              >
                {mode === m && (
                  <motion.span layoutId="cal-mode" className="absolute inset-0 rounded-full bg-white shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <span className="relative">{m === "month" ? "Month" : "List"}</span>
              </button>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Reveal delay={0.09}>
          <Card lift={false}>
            <div className={`mb-4 flex items-center justify-between rounded-2xl bg-gradient-to-r ${theme.grad} px-3 py-3 text-white shadow-md`}>
              <button onClick={() => go(-1)} aria-label="Previous month" className={navBtn}>
                ‹
              </button>
              <motion.div key={monthLabel} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="text-center">
                <p className="text-xl font-bold">
                  <span className="mr-2">{theme.icon}</span>
                  {monthLabel}
                </p>
                <p className="text-xs text-white/80">
                  {schoolDays} school days · {noSchoolDays} off · use the arrow keys to switch months
                </p>
              </motion.div>
              <button onClick={() => go(1)} aria-label="Next month" className={navBtn}>
                ›
              </button>
            </div>

            {mode === "month" ? (
              <>
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
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSelected(key)}
                        className={`min-h-[84px] rounded-xl border p-1.5 text-left align-top transition-colors ${look} ${past && !isSel ? "opacity-60" : ""}`}
                      >
                        <span
                          className={`text-xs font-semibold ${
                            isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-500/40" : "text-slate-600"
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
              </>
            ) : (
              <motion.div key={`agenda-${view.y}-${view.m}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                {agenda.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-400">Nothing scheduled this month.</p>
                ) : (
                  <ul className="space-y-2">
                    {agenda.map((e) => {
                      const d = parseKey(e.date);
                      return (
                        <li key={e.date + e.title}>
                          <button
                            onClick={() => setSelected(e.date)}
                            className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-brand-200 hover:bg-slate-50 ${
                              selected === e.date ? "border-brand-300 bg-brand-50/60" : "border-slate-100"
                            }`}
                          >
                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-slate-100">
                              <span className="text-[10px] font-semibold uppercase text-slate-500">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                              <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{e.title}</p>
                              <p className="text-xs text-slate-400">{when(daysUntil(e.date))}</p>
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${KINDS[e.kind].pill}`}>
                              {KINDS[e.kind].icon} {KINDS[e.kind].label}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            )}
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
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={selected} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                  {selEvents.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-400">{selWeekend ? "Weekend 😎" : "Regular school day"}</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {selEvents.map((e) => (
                        <li key={e.title} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${KINDS[e.kind].pill}`}>
                          <span>{KINDS[e.kind].icon}</span>
                          <span className="min-w-0 flex-1">{e.title}</span>
                          <button
                            onClick={() => downloadIcs(e)}
                            title="Add to my calendar"
                            aria-label={`Add ${e.title} to my calendar`}
                            className="shrink-0 rounded-md bg-white/60 px-2 py-0.5 text-xs font-semibold transition-colors hover:bg-white"
                          >
                            + Add
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              </AnimatePresence>
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
