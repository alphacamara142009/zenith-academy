"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader } from "@/components/ui";
import { usePortal } from "@/lib/store";

const tabs = ["Unread", "All", "Assignments", "Attendance", "Calendar", "Grades"] as const;
type Tab = (typeof tabs)[number];

const accent: Record<string, string> = {
  Assignments: "bg-violet-500",
  Attendance: "bg-amber-500",
  Calendar: "bg-sky-500",
  Grades: "bg-emerald-500",
};
const icon: Record<string, string> = { Assignments: "📌", Attendance: "✅", Calendar: "📅", Grades: "📊" };
const target: Record<string, { href: string; label: string }> = {
  Assignments: { href: "/dashboard", label: "See what is due" },
  Attendance: { href: "/attendance", label: "Open attendance" },
  Calendar: { href: "/calendar", label: "Open calendar" },
  Grades: { href: "/grades", label: "Open grades" },
};

export default function Notifications() {
  const { notifs, unread, setRead, markAllRead, toggleStar, dismiss, addDemo } = usePortal();
  const [tab, setTab] = useState<Tab>("Unread");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<number | null>(null);

  const shown = notifs.filter((n) => {
    if (tab === "Unread" && !n.unread) return false;
    if (tab !== "Unread" && tab !== "All" && n.kind !== tab) return false;
    const s = q.trim().toLowerCase();
    return !s || (n.title + " " + n.body).toLowerCase().includes(s);
  });

  const count = (t: Tab) => (t === "Unread" ? unread : t === "All" ? notifs.length : notifs.filter((n) => n.kind === t).length);

  const emptyTitle = q ? "No matches" : tab === "Unread" ? "You are all caught up 🎉" : "Nothing here yet";
  const emptyText = q ? "Try a different word." : "New updates show up here the moment they are posted.";

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Your latest assignments, grades, and school updates."
        right={
          <button
            onClick={addDemo}
            className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
          >
            Demo: simulate a new grade
          </button>
        }
      />

      <div className="mb-4 overflow-x-auto">
        <div className="inline-flex gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                tab === t ? "text-indigo-700" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="notif-tab"
                  className="absolute inset-0 rounded-lg bg-white shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">
                {t} <span className="text-xs text-slate-400">{count(t)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search updates"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-72"
        />
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-500">{unread} unread</span>
          <button
            onClick={markAllRead}
            disabled={unread === 0}
            className="font-semibold text-indigo-600 hover:text-indigo-700 disabled:text-slate-300"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {shown.map((n) => (
            <motion.li
              key={n.id}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className={`relative overflow-hidden rounded-xl border bg-white pl-1 transition-shadow hover:shadow-md ${
                n.unread ? "border-indigo-200" : "border-slate-200"
              }`}
            >
              <span className={`absolute inset-y-0 left-0 w-1 ${accent[n.kind]}`} />
              <div className="flex items-start gap-2 p-3 pl-4">
                <button
                  onClick={() => setRead(n.id, n.unread)}
                  title={n.unread ? "Mark as read" : "Mark as unread"}
                  aria-label={n.unread ? "Mark as read" : "Mark as unread"}
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm transition ${
                    n.unread
                      ? "border-indigo-400 text-transparent hover:bg-indigo-50 hover:text-indigo-500"
                      : "border-slate-200 bg-slate-100 text-slate-400"
                  }`}
                >
                  ✓
                </button>

                <button onClick={() => setOpenId(openId === n.id ? null : n.id)} className="min-w-0 flex-1 rounded-lg px-1 py-0.5 text-left">
                  <p className={`text-sm ${n.unread ? "font-semibold text-slate-900" : "font-medium text-slate-500"}`}>
                    {icon[n.kind]} {n.title}
                  </p>
                  <p className="text-sm text-slate-500">{n.body}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {n.kind} · {n.ago}
                  </p>
                </button>

                <button
                  onClick={() => toggleStar(n.id)}
                  title={n.starred ? "Remove star" : "Star"}
                  aria-label={n.starred ? "Remove star" : "Star"}
                  className={`h-9 w-9 shrink-0 rounded-lg text-lg hover:bg-slate-50 ${
                    n.starred ? "text-amber-400" : "text-slate-300 hover:text-amber-400"
                  }`}
                >
                  {n.starred ? "★" : "☆"}
                </button>
                <button
                  onClick={() => dismiss(n.id)}
                  title="Remove"
                  aria-label="Remove notification"
                  className="h-9 w-9 shrink-0 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                >
                  ✕
                </button>
              </div>

              <AnimatePresence initial={false}>
                {openId === n.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-100 px-4 py-3 pl-14">
                      <Link href={target[n.kind].href} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                        {target[n.kind].label} →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {shown.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-medium text-slate-600">{emptyTitle}</p>
          <p className="mt-1 text-sm text-slate-400">{emptyText}</p>
        </div>
      )}
    </>
  );
}