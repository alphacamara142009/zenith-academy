"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PortalProvider, usePortal } from "@/lib/store";
import { SchoolProvider, useSchool, type FeatureKey } from "@/lib/school";
import { DemoProvider, useDemo } from "@/lib/demo";
import { student } from "@/lib/data";

type NavItem = { href: string; label: string; icon: string; feature: FeatureKey | null };

const studentNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠", feature: null },
  { href: "/notifications", label: "Notifications", icon: "🔔", feature: "notifications" },
  { href: "/calendar", label: "Calendar", icon: "📅", feature: "calendar" },
  { href: "/schedule", label: "Schedule", icon: "🕒", feature: "schedule" },
  { href: "/classes", label: "Classes", icon: "📚", feature: "classes" },
  { href: "/attendance", label: "Attendance", icon: "✅", feature: "attendance" },
  { href: "/grades", label: "Grades", icon: "📊", feature: "grades" },
  { href: "/hallpass", label: "Hall Pass", icon: "🚪", feature: "hallpass" },
];

const teacherNav: NavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: "🏠", feature: null },
  { href: "/teacher/attendance", label: "Attendance", icon: "✅", feature: null },
];

const adminNav: NavItem[] = [
  { href: "/admin/overview", label: "Overview", icon: "📈", feature: null },
  { href: "/admin/users", label: "Users", icon: "👥", feature: null },
  { href: "/admin", label: "Settings", icon: "⚙️", feature: null },
];

const HOME: Record<string, string> = { Student: "/dashboard", Teacher: "/teacher", Admin: "/admin/overview" };
const ROLES = ["Student", "Teacher", "Admin"];
const ROLE_KEY = "zenith-role";

function areaOf(path: string) {
  return path.startsWith("/admin") ? "Admin" : path.startsWith("/teacher") ? "Teacher" : "Student";
}

function FeatureOff({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="text-4xl">🔒</p>
      <h2 className="mt-3 text-xl font-semibold">{name} is turned off</h2>
      <p className="mt-1 text-slate-500">Your school has switched this feature off.</p>
      <Link href="/dashboard" className="mt-4 inline-block font-semibold text-brand-600 hover:text-brand-700">
        Back to dashboard →
      </Link>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { unread } = usePortal();
  const { school } = useSchool();
  const { passes, announcements } = useDemo();
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<number[]>([]);
  const path = pathname ?? "";
  const area = areaOf(path);

  useEffect(() => {
    const r = sessionStorage.getItem(ROLE_KEY);
    if (!r) {
      router.replace("/");
      return;
    }
    setRole(r);
  }, [router]);

  // Keep each role inside its own area.
  useEffect(() => {
    if (role && area !== role) router.replace(HOME[role] ?? "/dashboard");
  }, [role, area, router]);

  function signOut() {
    sessionStorage.removeItem(ROLE_KEY);
    router.push("/");
  }

  // Demo only: jump between views with one click.
  function switchRole(r: string) {
    sessionStorage.setItem(ROLE_KEY, r);
    setRole(r);
    router.push(HOME[r]);
  }

  if (!role) return <div className="min-h-screen bg-slate-50" />;

  const who = role === "Student" ? student.name : role === "Teacher" ? "Mr. Okafor" : "Demo Admin";
  const initials = who.split(" ").map((w) => w[0]).join("");

  const items =
    role === "Student"
      ? studentNav.filter((n) => !n.feature || school.features[n.feature])
      : role === "Teacher"
        ? teacherNav
        : adminNav;

  const feature = role === "Student" ? (studentNav.find((n) => n.href === path)?.feature ?? null) : null;
  const featureOff = feature !== null && !school.features[feature];
  const showBell = role === "Student" && school.features.notifications;
  const pending = school.features.hallpass ? passes.filter((p) => p.status === "pending").length : 0;
  const banner = role === "Student" && school.features.announcements ? announcements.find((a) => !seen.includes(a.id)) : undefined;

  const content = area !== role ? null : featureOff ? <FeatureOff name={studentNav.find((n) => n.href === path)?.label ?? "This page"} /> : children;

  return (
    <div className="min-h-screen app-bg text-slate-900">
      {open && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white p-5 transition-transform duration-300 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white shadow-md shadow-brand-500/30">
            {school.mark || "Z"}
          </div>
          <div className="min-w-0">
            <p className="truncate font-bold leading-tight">{school.name}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">{role} portal</p>
          </div>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {items.map((n) => {
            const active = path === n.href;
            const badge = n.href === "/notifications" ? unread : n.href === "/teacher" ? pending : 0;
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active ? "text-brand-700" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-xl bg-brand-50"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative text-base">{n.icon}</span>
                <span className="relative">{n.label}</span>
                {badge > 0 && (
                  <motion.span
                    key={badge}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    className="relative ml-auto rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white"
                  >
                    {badge}
                  </motion.span>
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
            <div className="flex items-center gap-1 rounded-full bg-slate-100 p-1" role="group" aria-label="Demo view">
              {ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  aria-pressed={role === r}
                  className={`relative rounded-full px-3 py-1 text-xs font-semibold ${
                    role === r ? "text-brand-700" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {role === r && (
                    <motion.span
                      layoutId="role-switch"
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{r}</span>
                </button>
              ))}
            </div>

            {showBell && (
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
            )}
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{initials}</div>
              <span className="hidden text-sm font-medium lg:block">{who}</span>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            <AnimatePresence initial={false}>
              {banner && (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mb-5 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
                    <span className="text-xl">📣</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-800">{banner.title}</p>
                      {banner.body && <p className="text-sm text-slate-600">{banner.body}</p>}
                    </div>
                    <button
                      onClick={() => setSeen((s) => [...s, banner.id])}
                      aria-label="Dismiss announcement"
                      className="rounded-lg px-2 py-1 text-slate-400 hover:bg-white hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div key={path} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
              {content}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <SchoolProvider>
      <DemoProvider>
        <PortalProvider>
          <Shell>{children}</Shell>
        </PortalProvider>
      </DemoProvider>
    </SchoolProvider>
  );
}