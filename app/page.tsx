"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

const roles = ["Student", "Teacher", "Admin"];

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("Student");
  const [busy, setBusy] = useState(false);

  function signIn() {
    setBusy(true);
    sessionStorage.setItem("zenith-role", role);
    setTimeout(() => router.push("/dashboard"), 600);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-700 via-accent-700 to-fuchsia-600 p-6">
      <motion.div
        className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-sky-400/30 blur-3xl"
        animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-fuchsia-400/30 blur-3xl"
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl bg-white p-8 text-slate-900 shadow-2xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-2xl font-bold text-white">Z</div>
          <div>
            <h1 className="text-2xl font-bold">Zenith Academy</h1>
            <p className="text-sm text-slate-500">Welcome back. Sign in to continue.</p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`relative rounded-lg py-2 text-sm font-medium ${role === r ? "text-brand-700" : "text-slate-500 hover:text-slate-800"}`}
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

        <label className="mb-1 block text-sm font-medium">Email</label>
        <input
          type="email"
          placeholder="you@zenithacademy.org"
          className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
        <label className="mb-1 block text-sm font-medium">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          className="mb-6 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={signIn}
          disabled={busy}
          className="w-full rounded-xl bg-brand-600 py-3 font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-70"
        >
          {busy ? "Signing in..." : `Sign in as ${role}`}
        </motion.button>
        <p className="mt-4 text-center text-xs text-slate-400">Demo mode: real login comes later</p>
      </motion.div>
    </main>
  );
}
