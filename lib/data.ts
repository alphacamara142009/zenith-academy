// Demo data. Every name here is made up. Later this file gets replaced by the real database.

export const TODAY = new Date(2026, 9, 14); // fixed date so the demo always looks the same

export const student = {
  name: "Alex Rivera",
  first: "Alex",
  initials: "AR",
};

export type ClassInfo = {
  id: string;
  name: string;
  teacher: string;
  room: string;
  start: number; // minutes after midnight
  end: number;
  grade: number | null;
  soft: string;
};

export const classes: ClassInfo[] = [
  { id: "home", name: "Homeroom", teacher: "Ms. Hart", room: "146", start: 530, end: 540, grade: null, soft: "border-slate-200 bg-slate-50" },
  { id: "alg", name: "Algebra II A", teacher: "Ms. Hart", room: "146", start: 540, end: 600, grade: 84.2, soft: "border-sky-200 bg-sky-50" },
  { id: "it", name: "IT Fundamentals", teacher: "Mr. Okafor", room: "151", start: 603, end: 663, grade: 91, soft: "border-amber-200 bg-amber-50" },
  { id: "prog", name: "Programming", teacher: "Mr. Okafor", room: "151", start: 666, end: 726, grade: 88.5, soft: "border-rose-200 bg-rose-50" },
  { id: "gov", name: "American Government", teacher: "Mr. Lindqvist", room: "130", start: 744, end: 804, grade: 72.3, soft: "border-emerald-200 bg-emerald-50" },
  { id: "eng", name: "English III", teacher: "Ms. Brooks", room: "124", start: 807, end: 867, grade: 79.8, soft: "border-violet-200 bg-violet-50" },
  { id: "env", name: "Environmental Science", teacher: "Dr. Mensah", room: "126", start: 870, end: 930, grade: 76.9, soft: "border-orange-200 bg-orange-50" },
];

export const quarters = [
  { name: "Quarter 1", range: "Aug 19 - Oct 14", days: 57, done: 100 },
  { name: "Quarter 2", range: "Oct 15 - Jan 6", days: 84, done: 0 },
  { name: "Quarter 3", range: "Jan 7 - Mar 11", days: 63, done: 0 },
  { name: "Quarter 4", range: "Mar 12 - May 26", days: 76, done: 0 },
];

export const attendance = { present: 26, tardy: 2, absent: 1 };

export type CalEvent = { date: string; title: string; kind: "school" | "off" };

export const events: CalEvent[] = [
  { date: "2026-10-14", title: "End of Quarter 1", kind: "school" },
  { date: "2026-10-16", title: "Teacher Work Day - No School", kind: "off" },
  { date: "2026-10-21", title: "Report Cards Go Home", kind: "school" },
  { date: "2026-10-23", title: "Parent Teacher Conferences - No School", kind: "off" },
  { date: "2026-10-30", title: "PD Day - No School", kind: "off" },
];

export const assignments = [
  { id: 1, classId: "it", title: "System Administration Test", due: "2026-10-14" },
  { id: 2, classId: "gov", title: "Chapter 6 Essay", due: "2026-10-15" },
  { id: 3, classId: "env", title: "Food Sustainability Project", due: "2026-10-15" },
  { id: 4, classId: "prog", title: "Loops Practice", due: "2026-10-16" },
  { id: 5, classId: "eng", title: "Speech Writing Assignment", due: "2026-10-19" },
  { id: 6, classId: "alg", title: "Problem Set 4", due: "2026-10-20" },
];

export type NotifKind = "Assignments" | "Attendance" | "Calendar" | "Grades";

export type Notif = {
  id: number;
  kind: NotifKind;
  title: string;
  body: string;
  ago: string;
  unread: boolean;
  starred: boolean;
};

export const initialNotifs: Notif[] = [
  { id: 1, kind: "Assignments", title: "New assignment in Programming", body: "Loops Practice is due Oct 16.", ago: "2h ago", unread: true, starred: false },
  { id: 2, kind: "Assignments", title: "New assignment in IT Fundamentals", body: "System Administration Test is due today.", ago: "2h ago", unread: true, starred: false },
  { id: 3, kind: "Attendance", title: "Marked tardy in American Government", body: "You were marked tardy today.", ago: "4h ago", unread: true, starred: false },
  { id: 4, kind: "Assignments", title: "New assignment in Environmental Science", body: "Food Sustainability Project is due Oct 15.", ago: "7h ago", unread: true, starred: false },
  { id: 5, kind: "Calendar", title: "End of Quarter 1 is today", body: "Wednesday, Oct 14.", ago: "Yesterday", unread: true, starred: false },
  { id: 6, kind: "Grades", title: "New grade in Algebra II A", body: "Quiz 5: 18/20 (90%).", ago: "Yesterday", unread: true, starred: false },
  { id: 7, kind: "Assignments", title: "New assignment in English III", body: "Speech Writing Assignment is due Oct 19.", ago: "Yesterday", unread: true, starred: false },
  { id: 8, kind: "Calendar", title: "Teacher Work Day on Oct 16", body: "No school for students.", ago: "2 days ago", unread: false, starred: false },
  { id: 9, kind: "Grades", title: "Grade updated in English III", body: "Essay 2 was graded: 78/100.", ago: "2 days ago", unread: false, starred: true },
  { id: 10, kind: "Attendance", title: "Attendance corrected", body: "An absence on Oct 6 was changed to excused.", ago: "3 days ago", unread: false, starred: false },
];

export function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fmtTime(mins: number) {
  const h24 = Math.floor(mins / 60);
  const m = mins % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
}

export function letter(p: number) {
  if (p >= 90) return "A";
  if (p >= 80) return "B";
  if (p >= 70) return "C";
  if (p >= 60) return "D";
  return "F";
}

export function daysUntil(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const due = new Date(y, m - 1, d).getTime();
  const today = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()).getTime();
  return Math.round((due - today) / 86400000);
}

export function dueLabel(isoDate: string) {
  const n = daysUntil(isoDate);
  if (n < 0) return "Overdue";
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ---------- Grades (demo data) ----------

export type Score = { title: string; category: string; earned: number; possible: number; date: string };

// Newest first. Every class grade is calculated from these, so numbers always agree.
export const scores: Record<string, Score[]> = {
  alg: [
    { title: "Quiz 5", category: "Quiz", earned: 18, possible: 20, date: "2026-10-13" },
    { title: "Problem Set 3", category: "Homework", earned: 27, possible: 30, date: "2026-10-09" },
    { title: "Unit 2 Test", category: "Test", earned: 41, possible: 50, date: "2026-10-02" },
    { title: "Quiz 4", category: "Quiz", earned: 15, possible: 20, date: "2026-09-25" },
  ],
  it: [
    { title: "Networking Lab", category: "Lab", earned: 47, possible: 50, date: "2026-10-12" },
    { title: "Hardware Quiz", category: "Quiz", earned: 19, possible: 20, date: "2026-10-08" },
    { title: "OS Basics Test", category: "Test", earned: 44, possible: 50, date: "2026-10-01" },
    { title: "Lab 2", category: "Lab", earned: 9, possible: 10, date: "2026-09-24" },
  ],
  prog: [
    { title: "Variables Quiz", category: "Quiz", earned: 18, possible: 20, date: "2026-10-12" },
    { title: "Functions Project", category: "Project", earned: 88, possible: 100, date: "2026-10-07" },
    { title: "Debugging Lab", category: "Lab", earned: 17, possible: 20, date: "2026-09-30" },
    { title: "Intro Assignment", category: "Homework", earned: 10, possible: 10, date: "2026-09-18" },
  ],
  gov: [
    { title: "Chapter 5 Quiz", category: "Quiz", earned: 14, possible: 20, date: "2026-10-13" },
    { title: "Bill of Rights Test", category: "Test", earned: 36, possible: 50, date: "2026-10-06" },
    { title: "Chapter 4 Worksheet", category: "Homework", earned: 8, possible: 10, date: "2026-09-29" },
    { title: "Chapter 3 Quiz", category: "Quiz", earned: 15, possible: 20, date: "2026-09-22" },
  ],
  eng: [
    { title: "Essay 2", category: "Essay", earned: 78, possible: 100, date: "2026-10-12" },
    { title: "Reading Quiz 4", category: "Quiz", earned: 16, possible: 20, date: "2026-10-05" },
    { title: "Vocabulary Quiz", category: "Quiz", earned: 17, possible: 20, date: "2026-09-28" },
    { title: "Essay 1", category: "Essay", earned: 80, possible: 100, date: "2026-09-17" },
  ],
  env: [
    { title: "Ecosystems Test", category: "Test", earned: 37, possible: 50, date: "2026-10-09" },
    { title: "Lab Report 2", category: "Lab", earned: 21, possible: 30, date: "2026-10-02" },
    { title: "Chapter 4 Quiz", category: "Quiz", earned: 15, possible: 20, date: "2026-09-26" },
    { title: "Climate Worksheet", category: "Homework", earned: 9, possible: 10, date: "2026-09-19" },
  ],
};

// Calculates each class grade from its scores (total earned divided by total possible).
for (const c of classes) {
  const list = scores[c.id];
  if (list && list.length > 0) {
    const earned = list.reduce((sum, s) => sum + s.earned, 0);
    const possible = list.reduce((sum, s) => sum + s.possible, 0);
    c.grade = (earned / possible) * 100;
  }
}

// Picks colors for a grade: green for A, blue for B, yellow for C, red below that.
export function gradeTone(p: number) {
  if (p >= 90) return { bar: "bg-emerald-500", chip: "bg-emerald-100 text-emerald-700" };
  if (p >= 80) return { bar: "bg-sky-500", chip: "bg-sky-100 text-sky-700" };
  if (p >= 70) return { bar: "bg-amber-500", chip: "bg-amber-100 text-amber-700" };
  return { bar: "bg-rose-500", chip: "bg-rose-100 text-rose-700" };
}