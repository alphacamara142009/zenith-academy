"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export const PARENT_NAME = "Dana Rivera";

export type Msg = { id: number; from: string; text: string; at: number };
export type SchoolAlert = { id: number; title: string; body: string; level: "urgent" | "notice"; at: number; active: boolean; acks: string[] };

const AUTO = ["Ms. Hart", "Ms. Brooks"]; // These teachers send a demo auto-reply.
export const threadKey = (parent: string, teacher: string) => `${parent}|${teacher}`;

let counter = 9000;
const nextId = () => ++counter;

function seed(): Record<string, Msg[]> {
  const t = Date.now();
  const m = (from: string, text: string, minutesAgo: number): Msg => ({ id: nextId(), from, text, at: t - minutesAgo * 60000 });
  return {
    [threadKey("Dana Rivera", "Mr. Okafor")]: [
      m("Mr. Okafor", "Hi Dana! Alex did great on the Networking Lab this week.", 140),
      m("Dana Rivera", "Thank you! Is there anything he can practice at home?", 95),
    ],
    [threadKey("Chris Patel", "Mr. Okafor")]: [m("Chris Patel", "Could Maya make up the Hardware Quiz? She was out sick on Tuesday.", 20)],
    [threadKey("Dana Rivera", "Ms. Hart")]: [m("Ms. Hart", "Reminder: Problem Set 4 is due Tuesday.", 1500)],
    [threadKey("Dana Rivera", "Ms. Brooks")]: [],
  };
}

function seedRead(): Record<string, number> {
  const t = Date.now();
  return {
    [`Dana Rivera|${threadKey("Dana Rivera", "Mr. Okafor")}`]: t,
    [`Dana Rivera|${threadKey("Dana Rivera", "Ms. Hart")}`]: t,
    [`Mr. Okafor|${threadKey("Dana Rivera", "Mr. Okafor")}`]: t,
  };
}

type Chat = {
  threads: Record<string, Msg[]>;
  send: (key: string, from: string, text: string) => void;
  markRead: (viewer: string, key: string) => void;
  unreadIn: (viewer: string, key: string) => number;
  unread: (viewer: string) => number;
  alerts: SchoolAlert[];
  sendAlert: (title: string, body: string, level: SchoolAlert["level"]) => void;
  clearAlert: (id: number) => void;
  ackAlert: (id: number, who: string) => void;
};

const Ctx = createContext<Chat | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [threads, setThreads] = useState<Record<string, Msg[]>>(seed);
  const [lastRead, setLastRead] = useState<Record<string, number>>(seedRead);
  const [alerts, setAlerts] = useState<SchoolAlert[]>([]);

  const send = useCallback((key: string, from: string, text: string) => {
    setThreads((t) => ({ ...t, [key]: [...(t[key] ?? []), { id: nextId(), from, text, at: Date.now() }] }));
    const [parent, teacher] = key.split("|");
    if (from === parent && AUTO.includes(teacher)) {
      setTimeout(() => {
        setThreads((t) => ({
          ...t,
          [key]: [...(t[key] ?? []), { id: nextId(), from: teacher, text: "Thanks! I'll look into this and get back to you today.", at: Date.now() }],
        }));
      }, 1500);
    }
  }, []);

  const markRead = useCallback((viewer: string, key: string) => {
    setLastRead((r) => ({ ...r, [`${viewer}|${key}`]: Date.now() }));
  }, []);

  const unreadIn = (viewer: string, key: string) =>
    (threads[key] ?? []).filter((m) => m.from !== viewer && m.at > (lastRead[`${viewer}|${key}`] ?? 0)).length;

  const value: Chat = {
    threads,
    send,
    markRead,
    unreadIn,
    unread: (viewer) =>
      Object.keys(threads)
        .filter((k) => k.split("|").includes(viewer))
        .reduce((sum, k) => sum + unreadIn(viewer, k), 0),
    alerts,
    sendAlert: (title, body, level) =>
      setAlerts((l) => [{ id: nextId(), title, body, level, at: Date.now(), active: true, acks: [] }, ...l]),
    clearAlert: (id) => setAlerts((l) => l.map((a) => (a.id === id ? { ...a, active: false } : a))),
    ackAlert: (id, who) => setAlerts((l) => l.map((a) => (a.id === id && !a.acks.includes(who) ? { ...a, acks: [...a.acks, who] } : a))),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChat() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useChat must be used inside ChatProvider");
  return c;
}