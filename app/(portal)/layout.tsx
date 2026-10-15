"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { PortalProvider, usePortal } from "@/lib/store";
import { student } from "@/lib/data";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/notifications", label: "Notifications", icon: "🔔" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/schedule", label: "Schedule", icon: "🕒" },
  { href: "/classes", label: "Classes", icon: "📚" },
  { href: "/attendance", label: "Attendance", icon: "✅" },
  { href: "/grades", label: "Grades", icon: "📊" },
];

function ComingNext({ role }: { role: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="text-4xl">🚧</p>
      <h2 className="mt-3 text-xl font-semibold">The {role} workspace is coming next</h2>
      <p className="mt-1 text-slate-500">We are finishing the student side first.</p>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { unread } = usePortal();
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const r = sessionStorage.getItem("zenith-role");
    if (!r) {
      router.replace("/");
      return;
    }
    setRole(r);
  }, [router]);

  function signOut() {
    sessionStorage.removeItem("zenith-role");
    router.push("/");
  }

  if (!role) return <div className="min-h-screen bg-slate-50" />;

  const who = role === "Student" ? student.name : role === "Teacher" ? "Demo Teacher" : "Demo Admin";
  const initials = who.split(" ").map((w) => w[0]).join("");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white p-5 transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl font-bold text-white">Z</div>
          <div>
            <p className="font-bold leading-tight">Zenith Academy</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">{role} portal</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {nav.map((n) => {
            const active = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? "text-indigo-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-indigo-50"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative text-base">{n.icon}</span>
                <span className="relative">{n.label}</span>
                {n.href === "/notifications" && unread > 0 && (
                  <span className="relative ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={signOut}
          className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Sign out
        </button>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-8">
          <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            ☰
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">{role}</span>
            <Link href="/notifications" className="relative rounded-full p-2 hover:bg-slate-100" aria-label="Notifications">
              🔔
              {unread > 0 && (
                <motion.span
                  key={unread}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-0.5 -top-0.5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white"
                >
                  {unread}
                </motion.span>
              )}
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">{initials}</div>
              <span className="hidden text-sm font-medium sm:block">{who}</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <motion.div key={pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
              {role === "Student" ? children : <ComingNext role={role} />}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalProvider>
      <Shell>{children}</Shell>
    </PortalProvider>
  );
}
