"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { TODAY } from "@/lib/data";

const TAGS: Record<string, string> = {
  vegetarian: "bg-emerald-100 text-emerald-700",
  dairy: "bg-sky-100 text-sky-700",
  gluten: "bg-amber-100 text-amber-700",
  egg: "bg-yellow-100 text-yellow-700",
};

const MENU = [
  { day: "Monday", icon: "🍗", main: "Chicken tenders", side: "Roasted potatoes and green beans", alt: "Veggie nuggets", tags: ["gluten", "egg"] },
  { day: "Tuesday", icon: "🍕", main: "Cheese pizza", side: "Garden salad and fruit cup", alt: "Cheese pizza", tags: ["dairy", "gluten", "vegetarian"] },
  { day: "Wednesday", icon: "🌮", main: "Chicken tacos", side: "Rice, beans, and corn", alt: "Bean and cheese tacos", tags: ["dairy"] },
  { day: "Thursday", icon: "🍝", main: "Spaghetti with meat sauce", side: "Breadstick and steamed broccoli", alt: "Spaghetti with marinara", tags: ["gluten", "dairy"] },
  { day: "Friday", icon: "🍔", main: "Cheeseburger", side: "Baked fries and apple slices", alt: "Veggie burger", tags: ["gluten", "dairy"] },
];

const FACES = ["😍", "😐", "😕"];

export default function Lunch() {
  const todayName = TODAY.toLocaleDateString("en-US", { weekday: "long" });
  const [rating, setRating] = useState<Record<string, number>>({});

  return (
    <>
      <PageHeader title="Lunch Menu" subtitle="This week in the cafeteria." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {MENU.map((m, i) => {
          const isToday = m.day === todayName;
          return (
            <Reveal key={m.day} delay={0.03 + i * 0.05}>
              <Card className={isToday ? "ring-2 ring-brand-400" : ""}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">{m.day}</p>
                  {isToday && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">TODAY</span>}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <span className="text-4xl">{m.icon}</span>
                  <div>
                    <p className="font-semibold">{m.main}</p>
                    <p className="text-sm text-slate-500">{m.side}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Meatless option: <span className="font-medium text-slate-700">{m.alt}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.tags.map((t) => (
                    <span key={t} className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${TAGS[t]}`}>
                      {t === "vegetarian" ? "vegetarian" : `contains ${t}`}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-400">Rate it</span>
                  {FACES.map((f, fi) => (
                    <motion.button
                      key={f}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => setRating((r) => ({ ...r, [m.day]: fi }))}
                      aria-label={`Rate ${m.day} lunch ${f}`}
                      aria-pressed={rating[m.day] === fi}
                      className={`rounded-full px-1.5 text-xl transition-opacity ${rating[m.day] === undefined || rating[m.day] === fi ? "opacity-100" : "opacity-30"}`}
                    >
                      {f}
                    </motion.button>
                  ))}
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">Sample menu. Always confirm allergens with the cafeteria.</p>
    </>
  );
}