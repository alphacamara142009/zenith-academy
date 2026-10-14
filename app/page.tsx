"use client";

import { useState } from "react";

type Role = "Student" | "Teacher" | "Admin";

const roles: Role[] = ["Student", "Teacher", "Admin"];
const nav = ["Dashboard", "Classes", "Assignments", "Grades", "Schedule", "Messages"];

const stats = [
  { label: "Current GPA", value: "3.7", note: "+0.1 this quarter", color: "from-indigo-500 to-violet-500" },
  { label: "Attendance", value: "96%", note: "2 absences", color: "from-emerald-500 to-teal-500" },
  { label: "Due this week", value: "4", note: "1 due tomorrow", color: "from-amber-500 to-orange-500" },
];

const assignments = [
  { title: "Case Study Write-up", cls: "Computer Science", due: "Tomorrow", urgent: true },
  { title: "Chapter 6 Essay", cls: "US History", due: "Thursday", urgent: false },
  { title: "Problem Set 4", cls: "Algebra II", due: "Friday", urgent: false },
  { title: "Lab Report", cls: "Biology", due: "Next Monday", urgent: false },
];

const schedule = [
  { time: "8:00", name: "Algebra II", room: "Room 204" },
  { time: "9:00", name: "US History", room: "Room 118" },
  { time: "10:15", name: "Computer Science", room: "Lab 3" },
  { time: "11:15", name: "Biology", room: "Room 210" },
];

const announcements = [
  { title: "Picture day is Friday", body: "Dress nicely and arrive on time to your 2nd period." },
  { title: "Library extended hours", body: "Open until 5 PM through finals week." },
];

export default function Home() {
  const [pick, setPick] = useState<Role>("Student");
  const [role, setRole] = useState<Role | null>(null);
  const [active, setActive] = useState("Dashboard");

  if (!role) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-500 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">Z</div>
            <div>
              <h1 className="text-2xl font-bold">Zenith Academy</h1>
              <p className="text-sm text-slate-500">Sign in to your portal</p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setPick(r)}
                className={`rounded-lg py-2 text-sm font-medium transition ${
                  pick === r ? "bg-white text-indigo-600 shadow" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="you@zenithacademy.org"
            className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <button
            onClick={() => setRole(pick)}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Sign in as {pick}
          </button>
          <p className="mt-4 text-center text-xs text-slate-400">Demo mode: real login comes later</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-5 md:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">Z</div>
          <span className="text-lg font-bold">Zenith Academy</span>
        </div>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((n) => (
            <button
              key={n}
              onClick={() => setActive(n)}
              className={`rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
                active === n ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {n}
            </button>
          ))}
        </nav>
        <button
          onClick={() => setRole(null)}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Sign out
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Good morning 👋</h2>
            <p className="text-slate-500">Here is what is happening today.</p>
          </div>
          <span className="rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">{role}</span>
        </header>

        {role !== "Student" ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <h3 className="text-xl font-semibold">The {role} view is coming next</h3>
            <p className="mt-2 text-slate-500">We will build the full tools for this role after the student side.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-lg`}>
                  <p className="text-sm opacity-90">{s.label}</p>
                  <p className="mt-1 text-4xl font-bold">{s.value}</p>
                  <p className="mt-1 text-xs opacity-80">{s.note}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
                <h3 className="mb-4 text-lg font-semibold">Upcoming assignments</h3>
                <ul className="divide-y divide-slate-100">
                  {assignments.map((a) => (
                    <li key={a.title} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-sm text-slate-500">{a.cls}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          a.urgent ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {a.due}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Today</h3>
                <ul className="space-y-3">
                  {schedule.map((c) => (
                    <li key={c.name} className="flex gap-3">
                      <span className="w-12 pt-0.5 text-sm font-semibold text-indigo-600">{c.time}</span>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-sm text-slate-500">{c.room}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-semibold">Announcements</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {announcements.map((a) => (
                  <div key={a.title} className="rounded-xl bg-slate-50 p-4">
                    <p className="font-medium">{a.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{a.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}