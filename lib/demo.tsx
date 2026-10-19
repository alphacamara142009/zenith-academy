"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const ME = "Alex Rivera";
export const TEACHER = { name: "Mr. Okafor", classIds: ["it", "prog"] };
export const ROSTER = ["Alex Rivera", "Maya Patel", "Jordan Lee", "Sofia Martinez", "Ethan Brooks", "Ava Nguyen", "Liam Carter", "Zoe Thompson", "Noah Kim", "Isabella Rossi"];
export const REASONS = ["Restroom", "Water", "Nurse", "Office", "Locker", "Counselor"];

export type Mark = "present" | "tardy" | "absent";
export type PassStatus = "pending" | "active" | "returned" | "denied";
export type Pass = { id: number; student: string; reason: string; status: PassStatus; requestedAt: number; startedAt?: number; endedAt?: number };
export type Announcement = { id: number; title: string; body: string; author: string; at: number };
export type Role = "Student" | "Teacher" | "Parent" | "Admin";
export type Person = { id: number; name: string; role: Role; email: string; active: boolean };

let counter = 1000;
const nextId = () => ++counter;

export function emailFor(name: string) {
  const parts = name.toLowerCase().replace(/\./g, "").split(" ").filter((w) => w && w !== "mr" && w !== "ms" && w !== "dr");
  return `${parts.join(".")}@zenithacademy.org`;
}

function seedPasses(): Pass[] {
  const t = Date.now();
  return [
    { id: 1, student: "Maya Patel", reason: "Restroom", status: "active", requestedAt: t - 5 * 60000, startedAt: t - 4 * 60000 },
    { id: 2, student: "Jordan Lee", reason: "Nurse", status: "pending", requestedAt: t - 30000 },
    { id: 3, student: "Ethan Brooks", reason: "Water", status: "returned", requestedAt: t - 50 * 60000, startedAt: t - 49 * 60000, endedAt: t - 45 * 60000 },
  ];
}

function seedAnnouncements(): Announcement[] {
  const t = Date.now();
  return [
    { id: 1, title: "Quarter 2 starts tomorrow", body: "Check your updated schedule in the portal. Report cards go home Oct 21.", author: "Principal's Office", at: t - 3 * 3600000 },
    { id: 2, title: "Parent-teacher conferences on Oct 23", body: "No school for students that day. Sign-ups close Friday.", author: "Front Office", at: t - 26 * 3600000 },
  ];
}

function seedPeople(): Person[] {
  const mk = (name: string, role: Role, id: number): Person => ({ id, name, role, email: emailFor(name), active: true });
  return [
    ...ROSTER.map((n, i) => mk(n, "Student", i + 1)),
    ...["Mr. Okafor", "Ms. Hart", "Ms. Brooks", "Mr. Lindqvist", "Dr. Mensah"].map((n, i) => mk(n, "Teacher", 20 + i)),
    mk("Dana Rivera", "Parent", 40),
    mk("Chris Patel", "Parent", 41),
    mk("Demo Admin", "Admin", 50),
  ];
}

type Demo = {
  passes: Pass[];
  requestPass: (student: string, reason: string) => void;
  approvePass: (id: number) => void;
  denyPass: (id: number) => void;
  returnPass: (id: number) => void;
  announcements: Announcement[];
  postAnnouncement: (title: string, body: string, author: string) => void;
  removeAnnouncement: (id: number) => void;
  marks: Record<string, Record<string, Mark>>;
  submitted: string[];
  setMark: (classId: string, student: string, m: Mark) => void;
  markAll: (classId: string, m: Mark) => void;
  submit: (classId: string) => void;
  reopen: (classId: string) => void;
  people: Person[];
  addPerson: (name: string, role: Role, email: string) => void;
  togglePerson: (id: number) => void;
};

const Ctx = createContext<Demo | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [passes, setPasses] = useState<Pass[]>(seedPasses);
  const [announcements, setAnnouncements] = useState<Announcement[]>(seedAnnouncements);
  const [marks, setMarks] = useState<Record<string, Record<string, Mark>>>({});
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [people, setPeople] = useState<Person[]>(seedPeople);

  const patchPass = (id: number, patch: Partial<Pass>) => setPasses((l) => l.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const value: Demo = {
    passes,
    requestPass: (student, reason) => setPasses((l) => [{ id: nextId(), student, reason, status: "pending", requestedAt: Date.now() }, ...l]),
    approvePass: (id) => patchPass(id, { status: "active", startedAt: Date.now() }),
    denyPass: (id) => patchPass(id, { status: "denied" }),
    returnPass: (id) => patchPass(id, { status: "returned", endedAt: Date.now() }),
    announcements,
    postAnnouncement: (title, body, author) => setAnnouncements((l) => [{ id: nextId(), title, body, author, at: Date.now() }, ...l]),
    removeAnnouncement: (id) => setAnnouncements((l) => l.filter((a) => a.id !== id)),
    marks,
    submitted,
    setMark: (cid, student, m) => setMarks((all) => ({ ...all, [cid]: { ...(all[cid] ?? {}), [student]: m } })),
    markAll: (cid, m) => setMarks((all) => ({ ...all, [cid]: Object.fromEntries(ROSTER.map((s) => [s, m])) })),
    submit: (cid) => setSubmitted((l) => (l.includes(cid) ? l : [...l, cid])),
    reopen: (cid) => setSubmitted((l) => l.filter((x) => x !== cid)),
    people,
    addPerson: (name, role, email) => setPeople((l) => [{ id: nextId(), name, role, email, active: true }, ...l]),
    togglePerson: (id) => setPeople((l) => l.map((p) => (p.id === id ? { ...p, active: !p.active } : p))),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDemo() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDemo must be used inside DemoProvider");
  return c;
}

// Re-renders every second so timers tick.
export function useTick(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function clock(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function ago(at: number, now: number) {
  const m = Math.max(0, Math.round((now - at) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}