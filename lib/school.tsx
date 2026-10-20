"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

// To add a feature to the whole platform, add one line here.
export const FEATURES = [
  { key: "notifications", label: "Notifications", desc: "Alerts for assignments, grades, and attendance", icon: "🔔" },
  { key: "calendar", label: "Calendar", desc: "School events and no-school days", icon: "📅" },
  { key: "schedule", label: "Schedule", desc: "Weekly class timetable", icon: "🕒" },
  { key: "classes", label: "Classes", desc: "Class cards with teachers and next due work", icon: "📚" },
  { key: "attendance", label: "Attendance", desc: "Present, tardy, and absent history", icon: "✅" },
  { key: "grades", label: "Grades", desc: "Grades with a what-if calculator", icon: "📊" },
  { key: "hallpass", label: "Hall passes", desc: "Students request passes, teachers approve with live timers", icon: "🚪" },
  { key: "announcements", label: "Announcements", desc: "School-wide messages shown to students and parents", icon: "📣" },
  { key: "checkin", label: "QR check-in", desc: "Late students scan the front-desk code to mark themselves in", icon: "📱" },
  { key: "parents", label: "Parent portal", desc: "Parents see grades, attendance, and can report absences", icon: "👪" },
  { key: "messages", label: "Messaging", desc: "Parents and teachers message each other", icon: "💬" },
  { key: "alerts", label: "Emergency alerts", desc: "Admins send urgent notices everyone must acknowledge", icon: "🚨" },
  { key: "lunch", label: "Lunch menu", desc: "Weekly menu with allergen tags", icon: "🍎" },
  { key: "clubs", label: "Clubs", desc: "Students browse and join clubs", icon: "🎭" },
] as const;

export type FeatureKey = (typeof FEATURES)[number]["key"];

export const COMING_SOON = [
  { label: "Permission slips", icon: "✍️" },
  { label: "Bus tracking", icon: "🚌" },
  { label: "Payments", icon: "💳" },
  { label: "Mobile apps", icon: "📲" },
  { label: "Advanced reports", icon: "📈" },
  { label: "Lesson plans", icon: "🗂️" },
  { label: "Volunteer sign-ups", icon: "🙋" },
  { label: "Student ID cards", icon: "🪪" },
];

export const PRESETS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Emerald", hex: "#059669" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Rose", hex: "#e11d48" },
  { name: "Scarlet", hex: "#bb0000" },
  { name: "Purple", hex: "#7c3aed" },
];

export const DEFAULT_BRAND = "#6366f1";

export type Settings = {
  name: string;
  mark: string;
  brand: string;
  features: Record<FeatureKey, boolean>;
};

const ALL_ON = Object.fromEntries(FEATURES.map((f) => [f.key, true])) as Record<FeatureKey, boolean>;

const DEFAULTS: Settings = { name: "Zenith Academy", mark: "Z", brand: DEFAULT_BRAND, features: ALL_ON };

const KEY = "school-settings";

type RGB = [number, number, number];
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
const SHADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

function mix(hex: string, other: RGB, t: number) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (other[0] - r) * t, g + (other[1] - g) * t, b + (other[2] - b) * t);
}

function rotateHue(hex: string, deg: number) {
  const [r0, g0, b0] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r0, g0, b0);
  const min = Math.min(r0, g0, b0);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r0) h = ((g0 - b0) / d) % 6;
    else if (max === g0) h = (b0 - r0) / d + 2;
    else h = (r0 - g0) / d + 4;
    h *= 60;
  }
  h = (h + deg + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let rgb: RGB;
  if (h < 60) rgb = [c, x, 0];
  else if (h < 120) rgb = [x, c, 0];
  else if (h < 180) rgb = [0, c, x];
  else if (h < 240) rgb = [0, x, c];
  else if (h < 300) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  return rgbToHex((rgb[0] + m) * 255, (rgb[1] + m) * 255, (rgb[2] + m) * 255);
}

function scale(hex: string): Record<string, string> {
  return {
    "50": mix(hex, WHITE, 0.92),
    "100": mix(hex, WHITE, 0.84),
    "200": mix(hex, WHITE, 0.68),
    "300": mix(hex, WHITE, 0.48),
    "400": mix(hex, WHITE, 0.24),
    "500": hex,
    "600": mix(hex, BLACK, 0.12),
    "700": mix(hex, BLACK, 0.28),
    "800": mix(hex, BLACK, 0.42),
    "900": mix(hex, BLACK, 0.54),
  };
}

function applyBrand(hex: string | null) {
  const root = document.documentElement;
  if (!hex) {
    for (const n of SHADES) {
      root.style.removeProperty(`--brand-${n}`);
      root.style.removeProperty(`--accent-${n}`);
    }
    return;
  }
  const brand = scale(hex);
  const accent = scale(rotateHue(hex, 20));
  for (const n of SHADES) {
    root.style.setProperty(`--brand-${n}`, brand[n]);
    root.style.setProperty(`--accent-${n}`, accent[n]);
  }
}

type SchoolCtx = {
  school: Settings;
  update: (patch: Partial<Omit<Settings, "features">>) => void;
  setFeature: (key: FeatureKey, on: boolean) => void;
  reset: () => void;
};

const Ctx = createContext<SchoolCtx | null>(null);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [school, setSchool] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Settings>;
      setSchool({ ...DEFAULTS, ...saved, features: { ...ALL_ON, ...(saved.features ?? {}) } });
    } catch {
      // Saved settings were unreadable, so we keep the defaults.
    }
  }, []);

  useEffect(() => {
    applyBrand(school.brand.toLowerCase() === DEFAULT_BRAND ? null : school.brand);
  }, [school.brand]);

  function save(next: Settings) {
    setSchool(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Storage is blocked, so settings last for this visit only.
    }
  }

  const value: SchoolCtx = {
    school,
    update: (patch) => save({ ...school, ...patch }),
    setFeature: (key, on) => save({ ...school, features: { ...school.features, [key]: on } }),
    reset: () => save(DEFAULTS),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSchool() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSchool must be used inside SchoolProvider");
  return c;
}