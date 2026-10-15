"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, type ReactNode } from "react";

export function CountUp({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const value = useMotionValue(0);
  const text = useTransform(value, (v) => v.toFixed(decimals) + suffix);

  useEffect(() => {
    const controls = animate(value, to, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [to, value]);

  return <motion.span>{text}</motion.span>;
}

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay, ease: [0.22, 1, 0.36, 1] }}
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
      className={`rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${className}`}
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