"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";

const CLUBS = [
  { id: "robotics", icon: "🤖", name: "Robotics Club", when: "Tuesdays · 3:45 PM", where: "Room 151", sponsor: "Mr. Okafor", blurb: "Design, build, and program robots for spring competitions.", members: 18 },
  { id: "coding", icon: "💻", name: "Coding Club", when: "Mondays · 3:45 PM", where: "Room 151", sponsor: "Mr. Okafor", blurb: "Build games and websites together.", members: 22 },
  { id: "drama", icon: "🎭", name: "Drama Club", when: "Wednesdays · 3:45 PM", where: "Auditorium", sponsor: "Ms. Brooks", blurb: "Acting, stage crew, and the winter showcase.", members: 24 },
  { id: "chess", icon: "♟️", name: "Chess Club", when: "Thursdays · 3:45 PM", where: "Room 130", sponsor: "Mr. Lindqvist", blurb: "All levels welcome. Learn openings and play friendly matches.", members: 12 },
  { id: "council", icon: "🏛️", name: "Student Council", when: "Mondays · 3:45 PM", where: "Library", sponsor: "Ms. Hart", blurb: "Plan school events and bring student ideas to the principal.", members: 15 },
  { id: "art", icon: "🎨", name: "Art Club", when: "Fridays · 3:45 PM", where: "Room 126", sponsor: "Dr. Mensah", blurb: "Painting, drawing, and the spring gallery night.", members: 20 },
];

export default function Clubs() {
  const [joined, setJoined] = useState<string[]>([]);

  const toggle = (id: string) => setJoined((j) => (j.includes(id) ? j.filter((x) => x !== id) : [...j, id]));

  return (
    <>
      <PageHeader title="Clubs" subtitle={joined.length === 0 ? "Find something you love and join in." : `You have joined ${joined.length} ${joined.length === 1 ? "club" : "clubs"}.`} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CLUBS.map((c, i) => {
          const on = joined.includes(c.id);
          return (
            <Reveal key={c.id} delay={0.03 + i * 0.05}>
              <Card>
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-2xl">{c.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-slate-500">Sponsor: {c.sponsor}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">{c.blurb}</p>
                <p className="mt-3 text-xs text-slate-500">
                  🕒 {c.when} · 📍 {c.where}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{c.members + (on ? 1 : 0)} members</span>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => toggle(c.id)}
                    aria-pressed={on}
                    className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors ${
                      on ? "bg-emerald-100 text-emerald-700" : "bg-brand-600 text-white shadow-md shadow-brand-500/30 hover:bg-brand-700"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span key={on ? "on" : "off"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }} className="block">
                        {on ? "✓ Joined" : "Join"}
                      </motion.span>
                    </AnimatePresence>
                  </motion.button>
                </div>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}