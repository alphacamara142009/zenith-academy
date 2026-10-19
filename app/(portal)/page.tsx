"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { SchoolProvider, useSchool } from "@/lib/school";

const roles = ["Student", "Parent", "Teacher", "Admin"];
const HOME: Record<string, string> = { Student: "/dashboard", Parent: "/parent", Teacher: "/teacher", Admin: "/admin/overview" };

const HIGHLIGHTS = [
  { icon: "📊", title: "Live grades and attendance", text: "Students and parents always know where things stand." },
  { icon: "🚪", title: "Hall passes in one tap", text: "Requests, approvals, and live timers." },
  { icon: "📱", title: "QR check-in", text: "Late arrivals mark themselves in at the front desk." },
  { icon: "🛠️", title: "Built for any school", text: "Your name, your colors, and the features you choose." },
];

function LoginInner() {
  const router = useRouter();
  const { school } = useSchool();
  const [role, setRole] = useState("Student");
  const [busy, setBusy] = useState(false);

  function signIn() {
    setBusy(true);
    sessionStorage.setItem("zenith-role", role);
    setTimeout(() => router.push(HOME[role] ?? "/dashboard"), 500);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-accent-500 p-6">
      <motion.div
        className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-white/15 blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-accent-300/30 blur-3xl"
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto flex w-full max-w-5xl items-center justify-center gap-16">
        <div className="hidden flex-1 text-white lg:block">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold backdrop-blur">{school.mark || "Z"}</div>
            <h1 className="mt-5 text-5xl font-bold tracking-tight">{school.name}</h1>
            <p className="mt-3 max-w-md text-lg text-white/80">One place for everything school. Simple for students, parents, teachers, and staff.</p>
          </motion.div>
          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map((h, i) => (
              <motion.li
                key={h.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="flex items-start gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl backdrop-blur">{h.icon}</span>
                <div>
                  <p className="font-semibold">{h.title}</p>
                  <p className="text-sm text-white/75">{h.text}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-3xl bg-white p-8 text-slate-900 shadow-2xl"
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">{school.mark || "Z"}</div>
            <h1 className="text-2xl font-bold">{school.name}</h1>
          </div>
          <h2 className="text-2xl font-bold">Welcome back</h2>
          <p className="mb-6 text-sm text-slate-500">Sign in to continue.</p>

          <div className="mb-5 grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={`relative rounded-lg py-2 text-xs font-medium sm:text-sm ${role === r ? "text-brand-700" : "text-slate-500 hover:text-slate-800"}`}
              >
                {role === r && (
                  <motion.span
                    layoutId="role-pill"
                    className="absolute inset-0 rounded-lg bg-white shadow"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{r}</span>
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={signIn}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 py-3 text-sm font-medium hover:bg-slate-50"
          >
            <span className="text-lg font-bold text-blue-600">G</span> Continue with Google
          </motion.button>

          <div className="mb-4 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@school.org"
            className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={signIn}
            disabled={busy}
            className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 disabled:opacity-70"
          >
            {busy ? "Signing in..." : `Sign in as ${role}`}
          </motion.button>
          <p className="mt-4 text-center text-xs text-slate-400">Demo mode: pick any role to explore. Real login comes later.</p>
        </motion.div>
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <SchoolProvider>
      <LoginInner />
    </SchoolProvider>
  );
}