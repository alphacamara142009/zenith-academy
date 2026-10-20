"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PortalProvider, usePortal } from "@/lib/store";
import { SchoolProvider, useSchool, type FeatureKey } from "@/lib/school";
import { DemoProvider, TEACHER, useDemo } from "@/lib/demo";
import { ExtraProvider } from "@/lib/extra";
import { ChatProvider, PARENT_NAME, useChat } from "@/lib/chat";
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
  { href: "/checkin", label: "Check-in", icon: "📱", feature: "checkin" },
  { href: "/lunch", label: "Lunch Menu", icon: "🍎", feature: "lunch" },
  { href: "/clubs", label: "Clubs", icon: "🎭", feature: "clubs" },
];

const parentNav: NavItem[] = [
  { href: "/parent", label: "Dashboard", icon: "🏠", feature: "parents" },
  { href: "/parent/messages", label: "Messages", icon: "💬", feature: "messages" },
  { href: "/parent/absence", label: "Report absence", icon: "📝", feature: "parents" },
];

const teacherNav: NavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: "🏠", feature: null },
  { href: "/teacher/attendance", label: "Attendance", icon: "✅", feature: null },
  { href: "/teacher/gradebook", label: "Gradebook", icon: "📒", feature: null },
  { href: "/teacher/messages", label: "Messages", icon: "💬", feature: "messages" },
];

const adminNav: NavItem[] = [
  { href: "/admin/overview", label: "Overview", icon: "📈", feature: null },
  { href: "/admin/users", label: "Users", icon: "👥", feature: null },
  { href: "/admin/alerts", label: "Alerts", icon: "🚨", feature: "alerts" },
  { href: "/admin/checkin", label: "Check-in Kiosk", icon: "🖥️", feature: "checkin" },
  { href: "/admin", label: "Settings", icon: "⚙️", feature: null },
];

const NAVS: Record<string, NavItem[]> = { Student: studentNav, Parent: parentNav, Teacher: teacherNav, Admin: adminNav };
const ALL_NAV = [...studentNav, ...parentNav, ...teacherNav, ...adminNav];
const HOME: Record<string, string> = { Student: "/dashboard", Parent: "/parent", Teacher: "/teacher", Admin: "/admin/overview" };
const ROLES = ["Student", "Parent", "Teacher", "Admin"];
const ROLE_KEY = "zenith-role";

function areaOf(path: string) {
  if (path.startsWith("/admin")) return "Admin";
  if (path.startsWith("/teacher")) return "Teacher";
  if (path.startsWith("/parent")) return "Parent";
  return "Student";
}

// A soft glow that follows the mouse (computers only).
function CursorAura() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (ref.current) ref.current.style.transform = `translate3d(${x - 180}px, ${y - 180}px, 0)`;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-10 h-[360px] w-[360px] rounded-full"
      style={{
        transform: "translate3d(-600px, -600px, 0)",
        willChange: "transform",
        mixBlendMode: "multiply",
        opacity: 0.4,
        background: "radial-gradient(circle, color-mix(in srgb, var(--brand-300) 70%, transparent), transparent 65%)",
      }}
    />
  );
}

function FeatureOff({ name, home }: { name: string; home?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="text-4xl">🔒</p>
      <h2 className="mt-3 text-xl font-semibold">{name} is turned off</h2>
      <p className="mt-1 text-slate-500">Your school has switched this feature off.</p>
      {home && (
        <Link href={home} className="mt-4 inline-block font-semibold text-brand-600 hover:text-brand-700">
          Back to home →
        </Link>
      )}
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { unread } = usePortal();
  const { school } = useSchool();
  const { passes, announcements } = useDemo();
  const chat = useChat();
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState<number[]>([]);
  const [going, setGoing] = useState<string | null>(null);
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

  // The page arrived, so stop the loading bar.
  useEffect(() => {
    setGoing(null);
  }, [path]);

  useEffect(() => {
    if (!going) return;
    const t = setTimeout(() => setGoing(null), 12000);
    return () => clearTimeout(t);
  }, [going]);

  // Any link click shows instant feedback, even if the page takes a moment to load.
  function onNavClick(e: MouseEvent<HTMLDivElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as HTMLElement).closest("a");
    const href = a?.getAttribute("href");
    if (!a || !href || !href.startsWith("/") || a.target === "_blank") return;
    const target = href.split("?")[0].split("#")[0];
    if (target !== path) setGoing(target);
  }

  function signOut() {
    sessionStorage.removeItem(ROLE_KEY);
    router.push("/");
  }

  // Demo only: jump between views with one click.
  function switchRole(r: string) {
    sessionStorage.setItem(ROLE_KEY, r);
    setRole(r);
    setGoing(HOME[r]);
  }

  if (!role) return <div className="min-h-screen bg-slate-50" />;

  const who = role === "Student" ? student.name : role === "Parent" ? PARENT_NAME : role === "Teacher" ? TEACHER.name : "Demo Admin";
  const initials = who.split(" ").map((w) => w[0]).join("");
  const here = going ?? path;

  const items = (NAVS[role] ?? studentNav).filter((n) => !n.feature || school.features[n.feature]);
  const current = ALL_NAV.find((n) => n.href === path);
  const gated = current?.feature ?? null;
  const featureOff = gated !== null && !school.features[gated];
  const showBell = role === "Student" && school.features.notifications;
  const waiting = school.features.hallpass ? passes.filter((p) => p.status === "pending").length : 0;
  const msgViewer = role === "Parent" ? PARENT_NAME : TEACHER.name;
  const badgeFor = (href: string) =>
    href === "/notifications" ? unread : href === "/teacher" ? waiting : href.endsWith("/messages") ? chat.unread(msgViewer) : 0;

  const latest = announcements[0];
  const banner =
    (role === "Student" || role === "Parent") && school.features.announcements && latest && !seen.includes(latest.id) ? latest : undefined;
  const alertNow = school.features.alerts && role !== "Admin" ? chat.alerts.find((a) => a.active && !a.acks.includes(role)) : undefined;

  const content =
    area !== role ? null : featureOff ? <FeatureOff name={current?.label ?? "This page"} home={role === "Parent" ? undefined : HOME[role]} /> : children;

  return (
    <div className="min-h-screen app-bg text-slate-900" onClickCapture={onNavClick}>
      <CursorAura />

      <AnimatePresence>
        {going && going !== path && (
          <motion.div
            key="bar"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 0.85 }}
            exit={{ scaleX: 1, opacity: 0, transition: { duration: 0.25 } }}
            transition={{ duration: 6, ease: [0.1, 0.8, 0.2, 1] }}
            style={{ transformOrigin: "left" }}
            className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-gradient-to-r from-brand-400 to-accent-500"
          />
        )}
      </AnimatePresence>

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

        <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
          {items.map((n) => {
            const active = here === n.href;
            const badge = badgeFor(n.href);
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
        <div className="sticky top-0 z-20">
          <header className="flex items-center gap-3 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-8">
            <button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              ☰
            </button>
            <div className="ml-auto flex items-center gap-3">
              <select
                value={role}
                onChange={(e) => switchRole(e.target.value)}
                aria-label="Demo view"
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-brand-700 outline-none sm:hidden"
              >
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <div className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 sm:flex" role="group" aria-label="Demo view">
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

          <AnimatePresence initial={false}>
            {alertNow && (
              <motion.div
                key={alertNow.id}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
                role="alert"
              >
                <div className={`flex flex-wrap items-center gap-3 px-4 py-3 text-white md:px-8 ${alertNow.level === "urgent" ? "bg-rose-600" : "bg-amber-500"}`}>
                  <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-xl">
                    🚨
                  </motion.span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{alertNow.title}</p>
                    {alertNow.body && <p className="text-sm text-white/90">{alertNow.body}</p>}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => chat.ackAlert(alertNow.id, role)}
                    className="rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-slate-900 shadow"
                  >
                    Got it
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
        <ExtraProvider>
          <ChatProvider>
            <PortalProvider>
              <Shell>{children}</Shell>
            </PortalProvider>
          </ChatProvider>
        </ExtraProvider>
      </DemoProvider>
    </SchoolProvider>
  );
}