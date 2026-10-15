"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui";
import { TODAY, classes, fmtTime, iso } from "@/lib/data";
import { eventsOn, isNoSchool } from "@/lib/calendar";

const START = 520; // 8:40 AM
const END = 940; // 3:40 PM
const PX = 1.15; // pixels per minute
const HOURS = [9, 10, 11, 12, 13, 14, 15];
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function hourLabel(h: number) {
  return `${h % 12 === 0 ? 12 : h % 12} ${h >= 12 ? "PM" : "AM"}`;
}

export default function Schedule() {
  const [offset, setOffset] = useState(0);

  const monday = new Date(TODAY);
  monday.setDate(TODAY.getDate() - ((TODAY.getDay() + 6) % 7) + offset * 7);

  const days = DAY_NAMES.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = iso(d);
    return { name, d, key, off: isNoSchool(key), evs: eventsOn(key) };
  });

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const todayKey = iso(TODAY);
  const bodyHeight = (END - START) * PX;
  const navBtn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg text-slate-600 hover:bg-slate-50";

  return (
    <>
      <PageHeader
        title="Schedule"
        subtitle={`Week of ${fmt(days[0].d)} - ${fmt(days[4].d)}`}
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => setOffset((o) => o - 1)} aria-label="Previous week" className={navBtn}>
              ‹
            </button>
            <button
              onClick={() => setOffset(0)}
              disabled={offset === 0}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:text-slate-300"
            >
              Today
            </button>
            <button onClick={() => setOffset((o) => o + 1)} aria-label="Next week" className={navBtn}>
              ›
            </button>
          </div>
        }
      />

      <motion.div
        key={offset}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="overflow-x-auto rounded-2xl border border-slate-200/70 bg-white shadow-sm"
      >
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[56px_repeat(5,minmax(0,1fr))] border-b border-slate-100">
            <div />
            {days.map((day) => {
              const isToday = day.key === todayKey;
              return (
                <div key={day.key} className={`px-2 py-3 text-center ${isToday ? "bg-indigo-50/60" : ""}`}>
                  <p className="text-xs font-semibold uppercase text-slate-400">{day.name}</p>
                  <p className={`text-lg font-bold ${isToday ? "text-indigo-600" : ""}`}>{day.d.getDate()}</p>
                  {day.evs.map((e) => (
                    <p
                      key={e.title}
                      className={`mx-auto mt-1 w-fit max-w-full truncate rounded-md px-2 py-0.5 text-[10px] font-medium ${
                        e.kind === "off" ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"
                      }`}
                    >
                      {e.title}
                    </p>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[56px_repeat(5,minmax(0,1fr))]" style={{ height: bodyHeight }}>
            <div className="relative">
              {HOURS.map((h) => (
                <span
                  key={h}
                  className="absolute right-2 -translate-y-1/2 text-[11px] text-slate-400"
                  style={{ top: (h * 60 - START) * PX }}
                >
                  {hourLabel(h)}
                </span>
              ))}
            </div>

            {days.map((day, di) => {
              const isToday = day.key === todayKey;
              return (
                <div key={day.key} className={`relative border-l border-slate-100 ${isToday ? "bg-indigo-50/40" : ""}`}>
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute inset-x-0 border-t border-dashed border-slate-100"
                      style={{ top: (h * 60 - START) * PX }}
                    />
                  ))}

                  {day.off ? (
                    <div className="absolute inset-x-2 top-6 rounded-xl bg-amber-50 p-3 text-center text-sm font-medium text-amber-700">
                      No school
                    </div>
                  ) : (
                    classes.map((c, i) => {
                      const h = (c.end - c.start) * PX;
                      return (
                        <Link
                          key={c.id}
                          href="/classes"
                          title={`${c.name} · ${fmtTime(c.start)} - ${fmtTime(c.end)} · Room ${c.room}`}
                          className="absolute inset-x-1"
                          style={{ top: (c.start - START) * PX, height: h - 2 }}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: di * 0.04 + i * 0.02, duration: 0.25 }}
                            whileHover={{ scale: 1.02 }}
                            className={`h-full overflow-hidden rounded-lg border px-2 py-1 ${c.soft}`}
                          >
                            {h >= 40 && (
                              <>
                                <p className="truncate text-xs font-semibold">{c.name}</p>
                                <p className="truncate text-[11px] text-slate-500">
                                  {fmtTime(c.start)} - {fmtTime(c.end)}
                                </p>
                              </>
                            )}
                            {h >= 56 && <p className="text-[11px] text-slate-400">Room {c.room}</p>}
                          </motion.div>
                        </Link>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </>
  );
}