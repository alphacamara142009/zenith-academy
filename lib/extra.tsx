"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { fmtTime } from "./data";

export const BELL = 8 * 60 + 50; // 8:50 AM. Arriving after this is tardy.
export const CODE_MS = 30000; // The front-desk code changes every 30 seconds.

// Demo only. A real version creates and checks codes on the school's server.
export function codeFor(slot: number) {
  let x = (Math.abs(slot) % 1000003) + 17;
  x = (x * 48271) % 2147483647;
  x = (x * 48271) % 2147483647;
  return String(x % 1000000).padStart(6, "0");
}
export const slotOf = (now: number) => Math.floor(now / CODE_MS);

export type CheckIn = { id: number; student: string; time: string; status: "on time" | "tardy" };
export type Absence = { id: number; date: string; reason: string; note: string };

type Extra = {
  clockOverride: number | null;
  setClockOverride: (minutes: number | null) => void;
  checkins: CheckIn[];
  checkIn: (student: string, code: string) => { ok: boolean; message: string };
  clearCheckins: () => void;
  edits: Record<string, number>;
  setEdit: (key: string, value: number) => void;
  absences: Absence[];
  reportAbsence: (date: string, reason: string, note: string) => void;
  removeAbsence: (id: number) => void;
};

const Ctx = createContext<Extra | null>(null);
let counter = 5000;

export function ExtraProvider({ children }: { children: ReactNode }) {
  const [clockOverride, setClockOverride] = useState<number | null>(null);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [absences, setAbsences] = useState<Absence[]>([]);

  const value: Extra = {
    clockOverride,
    setClockOverride,
    checkins,
    checkIn: (student, code) => {
      const slot = slotOf(Date.now());
      if (code !== codeFor(slot) && code !== codeFor(slot - 1)) {
        return { ok: false, message: "That code is not valid. Check the screen at the front desk and try again." };
      }
      if (checkins.some((c) => c.student === student)) {
        return { ok: false, message: "You are already checked in today." };
      }
      const d = new Date();
      const mins = clockOverride ?? d.getHours() * 60 + d.getMinutes();
      const status: CheckIn["status"] = mins <= BELL ? "on time" : "tardy";
      setCheckins((l) => [{ id: ++counter, student, time: fmtTime(mins), status }, ...l]);
      return {
        ok: true,
        message: status === "on time" ? `You are checked in at ${fmtTime(mins)}. Have a great day!` : `Checked in at ${fmtTime(mins)}. You are marked tardy.`,
      };
    },
    clearCheckins: () => setCheckins([]),
    edits,
    setEdit: (key, v) => setEdits((e) => ({ ...e, [key]: v })),
    absences,
    reportAbsence: (date, reason, note) => setAbsences((l) => [{ id: ++counter, date, reason, note }, ...l]),
    removeAbsence: (id) => setAbsences((l) => l.filter((a) => a.id !== id)),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExtra() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useExtra must be used inside ExtraProvider");
  return c;
}