import { events as baseEvents, iso } from "./data";

export type Kind = "school" | "off" | "sports" | "exam" | "activity";
export type CalendarEvent = { date: string; title: string; kind: Kind };

export const KINDS: Record<Kind, { label: string; icon: string; pill: string; dot: string }> = {
  school: { label: "School", icon: "🏫", pill: "bg-sky-100 text-sky-800", dot: "bg-sky-500" },
  off: { label: "No school", icon: "🏖️", pill: "bg-amber-100 text-amber-800", dot: "bg-amber-500" },
  sports: { label: "Sports", icon: "🏆", pill: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500" },
  exam: { label: "Exams", icon: "📝", pill: "bg-rose-100 text-rose-800", dot: "bg-rose-500" },
  activity: { label: "Activities", icon: "🎉", pill: "bg-violet-100 text-violet-800", dot: "bg-violet-500" },
};

function range(from: string, to: string, title: string, kind: Kind): CalendarEvent[] {
  const out: CalendarEvent[] = [];
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const end = new Date(ty, tm - 1, td).getTime();
  for (let d = new Date(fy, fm - 1, fd); d.getTime() <= end; d.setDate(d.getDate() + 1)) {
    out.push({ date: iso(d), title, kind });
  }
  return out;
}

// Demo calendar. The first events come from data.ts; the rest are examples.
export const allEvents: CalendarEvent[] = [
  { date: "2026-09-07", title: "Labor Day - No School", kind: "off" },
  { date: "2026-09-18", title: "Picture Day", kind: "activity" },
  { date: "2026-10-02", title: "Homecoming Spirit Day", kind: "activity" },
  { date: "2026-10-09", title: "Volleyball vs. Northside", kind: "sports" },
  ...baseEvents,
  { date: "2026-10-15", title: "Quarter 2 Begins", kind: "school" },
  { date: "2026-10-20", title: "PSAT Practice Test", kind: "exam" },
  { date: "2026-10-22", title: "Volleyball vs. Eastside", kind: "sports" },
  ...range("2026-10-26", "2026-10-28", "Book Fair", "activity"),
  { date: "2026-10-27", title: "Soccer Senior Night", kind: "sports" },
  { date: "2026-10-29", title: "Halloween Spirit Day", kind: "activity" },
  { date: "2026-11-11", title: "Veterans Day - No School", kind: "off" },
  { date: "2026-11-12", title: "Science Fair", kind: "activity" },
  { date: "2026-11-19", title: "Unit Exams", kind: "exam" },
  ...range("2026-11-25", "2026-11-27", "Thanksgiving Break", "off"),
  ...range("2026-12-15", "2026-12-18", "Semester Exams", "exam"),
  ...range("2026-12-21", "2027-01-01", "Winter Break", "off"),
].sort((a, b) => a.date.localeCompare(b.date));

export function eventsOn(key: string) {
  return allEvents.filter((e) => e.date === key);
}

export function isNoSchool(key: string) {
  return eventsOn(key).some((e) => e.kind === "off");
}

export function parseKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}