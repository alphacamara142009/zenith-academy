"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { initialNotifs, type Notif } from "./data";

type Toast = { id: number; message: string; undo: () => void };

type Portal = {
  notifs: Notif[];
  unread: number;
  setRead: (id: number, read: boolean) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  toggleStar: (id: number) => void;
  dismiss: (id: number) => void;
  addDemo: () => void;
};

const Ctx = createContext<Portal | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<Notif[]>(initialNotifs);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifs = all.filter((n) => !dismissed.includes(n.id));

  function closeToast() {
    if (timer.current) clearTimeout(timer.current);
    setToast(null);
  }

  function showToast(message: string, undo: () => void) {
    if (timer.current) clearTimeout(timer.current);
    setToast({ id: Date.now(), message, undo });
    timer.current = setTimeout(() => setToast(null), 6000);
  }

  const value: Portal = {
    notifs,
    unread: notifs.filter((n) => n.unread).length,
    setRead: (id, read) => {
      setAll((l) => l.map((n) => (n.id === id ? { ...n, unread: !read } : n)));
      if (read) {
        showToast("Marked as read", () => setAll((l) => l.map((n) => (n.id === id ? { ...n, unread: true } : n))));
      }
    },
    markRead: (id) => setAll((l) => l.map((n) => (n.id === id ? { ...n, unread: false } : n))),
    markAllRead: () => {
      const ids = notifs.filter((n) => n.unread).map((n) => n.id);
      if (ids.length === 0) return;
      setAll((l) => l.map((n) => (ids.includes(n.id) ? { ...n, unread: false } : n)));
      showToast(`${ids.length} marked as read`, () =>
        setAll((l) => l.map((n) => (ids.includes(n.id) ? { ...n, unread: true } : n)))
      );
    },
    toggleStar: (id) => setAll((l) => l.map((n) => (n.id === id ? { ...n, starred: !n.starred } : n))),
    dismiss: (id) => {
      setDismissed((d) => [...d, id]);
      showToast("Notification removed", () => setDismissed((d) => d.filter((x) => x !== id)));
    },
    addDemo: () =>
      setAll((l) => [
        { id: Date.now(), kind: "Grades", title: "New grade in Programming", body: "Loops Quiz: 19/20 (95%).", ago: "Just now", unread: true, starred: false },
        ...l,
      ]),
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4"
          >
            <div
              role="status"
              className="pointer-events-auto flex items-center gap-4 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-2xl"
            >
              <span>{toast.message}</span>
              <button
                onClick={() => {
                  toast.undo();
                  closeToast();
                }}
                className="font-semibold text-brand-300 hover:text-brand-200"
              >
                Undo
              </button>
              <button onClick={closeToast} aria-label="Close" className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

export function usePortal() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePortal must be used inside PortalProvider");
  return c;
}