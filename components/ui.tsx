"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, type ReactNode } from "react";

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

export function Card({ children, className = "", lift = true }: { children: ReactNode; className?: string; lift?: boolean }) {
  return (
    <motion.div
      whileHover={lift ? { y: -3 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-[box-shadow,border-color] duration-200 hover:border-brand-200 hover:shadow-md hover:shadow-brand-500/10 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </Reveal>
  );
}

// Picks a ring color for a grade (green A, blue B, yellow C, red below).
export function ringColor(p: number) {
  if (p >= 90) return "text-emerald-500";
  if (p >= 80) return "text-sky-500";
  if (p >= 70) return "text-amber-500";
  return "text-rose-500";
}

// A circle that fills up to a percentage. Put anything you like inside it.
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
          transition={{
            pathLength: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.2, delay },
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}