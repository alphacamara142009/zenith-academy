"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, type CSSProperties, type MouseEvent, type ReactNode } from "react";

export function CountUp({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const reduce = useReducedMotion();
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => v.toFixed(decimals) + suffix);

  useEffect(() => {
    if (reduce) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [to, value, reduce]);

  return <motion.span>{text}</motion.span>;
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// A thin glowing outline that follows the cursor.
const EDGE = {
  padding: 1.5,
  background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), var(--brand-500), transparent 70%)",
  WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
  maskComposite: "exclude",
} as CSSProperties;

const LIGHT = {
  background: "radial-gradient(440px circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--brand-400) 16%, transparent), transparent 65%)",
} as CSSProperties;

export function Card({ children, className = "", lift = true }: { children: ReactNode; className?: string; lift?: boolean }) {
  function track(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  }
  return (
    <motion.div
      onMouseMove={track}
      whileHover={lift ? { y: -3 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`group/card relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-transparent hover:shadow-lg hover:shadow-brand-500/10 ${className}`}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" style={LIGHT} />
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/card:opacity-100" style={EDGE} />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

const TITLE_ICONS: Record<string, string> = {
  Notifications: "🔔",
  Calendar: "📅",
  Schedule: "🕒",
  Classes: "📚",
  Attendance: "✅",
  Grades: "📊",
  "Hall Pass": "🚪",
  Overview: "📈",
  Users: "👥",
  "Control Center": "⚙️",
  Gradebook: "📒",
  "Report an absence": "📝",
  "Check-in": "📱",
  "Check-in Kiosk": "🖥️",
  Messages: "💬",
  "Lunch Menu": "🍎",
  Clubs: "🎭",
  Alerts: "🚨",
  Planner: "✏️",
  "ID Card": "🪪",
  "Bus Tracker": "🚌",
  "Permission slips": "✍️",
  Volunteer: "🙋",
};

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  const icon = TITLE_ICONS[title];
  return (
    <Reveal className="mb-6">
      <div className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 px-6 py-5 text-white shadow-lg shadow-brand-500/20 md:px-8 md:py-6">
        <div className="pointer-events-none absolute -right-8 -top-14 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        {icon && (
          <span aria-hidden className="pointer-events-none absolute -bottom-4 right-6 select-none text-[88px] leading-none opacity-20">
            {icon}
          </span>
        )}
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1 text-white/80">{subtitle}</p>}
        </div>
        {right && <div className="relative rounded-xl bg-white/90 p-1.5 shadow-sm backdrop-blur">{right}</div>}
      </div>
    </Reveal>
  );
}

export function ringColor(p: number) {
  if (p >= 90) return "text-emerald-500";
  if (p >= 80) return "text-sky-500";
  if (p >= 70) return "text-amber-500";
  return "text-rose-500";
}

export function ProgressRing({
  value,
  size = 72,
  stroke = 7,
  colorClass = "text-brand-500",
  trackClass = "text-slate-100",
  delay = 0,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  colorClass?: string;
  trackClass?: string;
  delay?: number;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const pct = Math.max(0, Math.min(100, value)) / 100;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className={trackClass} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={colorClass}
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: pct, opacity: 1 }}
          transition={{ pathLength: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.2, delay } }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

const AVATARS = [
  "from-sky-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-sky-500",
];

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const hash = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white ${AVATARS[hash % AVATARS.length]}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}