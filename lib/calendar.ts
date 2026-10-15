import { events as baseEvents, iso, type CalEvent } from "./data";

function range(from: string, to: string, title: string, kind: CalEvent["kind"]): CalEvent[] {
  const out: CalEvent[] = [];
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  const end = new Date(ty, tm - 1, td).getTime();
  for (let d = new Date(fy, fm - 1, fd); d.getTime() <= end; d.setDate(d.getDate() + 1)) {
    out.push({ date: iso(d), title, kind });
  }
  return out;
}

// Demo calendar. The first events come from data.ts; the rest are examples.
export const allEvents: CalEvent[] = [
  { date: "2026-09-07", title: "Labor Day - No School", kind: "off" },
  ...baseEvents,
  ...range("2026-11-25", "2026-11-27", "Thanksgiving Break", "off"),
  ...range("2026-12-21", "2027-01-01", "Winter Break", "off"),
];

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