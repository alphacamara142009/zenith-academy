"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, Card, PageHeader, Reveal } from "@/components/ui";
import { emailFor, useDemo, type Role } from "@/lib/demo";

const FILTERS: ("All" | Role)[] = ["All", "Student", "Teacher", "Parent", "Admin"];
const ADD_ROLES: Role[] = ["Student", "Teacher", "Parent", "Admin"];
const BADGE: Record<Role, string> = {
  Student: "bg-sky-100 text-sky-700",
  Teacher: "bg-violet-100 text-violet-700",
  Parent: "bg-amber-100 text-amber-700",
  Admin: "bg-rose-100 text-rose-700",
};
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

export default function Users() {
  const { people, addPerson, togglePerson } = useDemo();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | Role>("All");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Student");

  const count = (f: "All" | Role) => (f === "All" ? people.length : people.filter((p) => p.role === f).length);
  const shown = people.filter((p) => {
    if (filter !== "All" && p.role !== filter) return false;
    const s = q.trim().toLowerCase();
    return !s || (p.name + " " + p.email).toLowerCase().includes(s);
  });

  function add() {
    const n = name.trim();
    if (!n) return;
    addPerson(n, role, emailFor(n));
    setName("");
  }

  return (
    <>
      <PageHeader title="Users" subtitle="Sample roster for the demo. Later this comes from your real student system." />

      <Reveal delay={0.04} className="mb-6">
        <Card lift={false}>
          <h2 className="mb-3 font-semibold">Add a user</h2>
          <div className="flex flex-wrap gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Full name"
              aria-label="Full name"
              className={`${inputClass} sm:max-w-xs`}
            />
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} aria-label="Role" className={`${inputClass} sm:w-40`}>
              {ADD_ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={!name.trim()}
              onClick={add}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/30 hover:bg-brand-700 disabled:opacity-40"
            >
              Add user
            </motion.button>
          </div>
        </Card>
      </Reveal>

      <Reveal delay={0.08}>
        <Card lift={false}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`relative rounded-lg px-3 py-1.5 text-sm font-medium ${filter === f ? "text-brand-700" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {filter === f && (
                    <motion.span
                      layoutId="user-filter"
                      className="absolute inset-0 rounded-lg bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">
                    {f} <span className="text-xs text-slate-400">{count(f)}</span>
                  </span>
                </button>
              ))}
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people" aria-label="Search people" className={`${inputClass} sm:w-64`} />
          </div>

          <ul className="divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {shown.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3 py-3"
                >
                  <Avatar name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${p.active ? "" : "text-slate-400 line-through"}`}>{p.name}</p>
                    <p className="truncate text-sm text-slate-500">{p.email}</p>
                  </div>
                  <span className={`hidden rounded-full px-3 py-1 text-xs font-semibold sm:inline ${BADGE[p.role]}`}>{p.role}</span>
                  <button
                    role="switch"
                    aria-checked={p.active}
                    aria-label={`${p.name} active`}
                    onClick={() => togglePerson(p.id)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${p.active ? "bg-emerald-500" : "bg-slate-300"}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${p.active ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
            {shown.length === 0 && <li className="py-8 text-center text-sm text-slate-400">No one matches.</li>}
          </ul>
        </Card>
      </Reveal>
    </>
  );
}