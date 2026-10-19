"use client";

import { motion } from "motion/react";
import { Card, PageHeader, Reveal } from "@/components/ui";
import { COMING_SOON, FEATURES, PRESETS, useSchool } from "@/lib/school";

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200";

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-brand-500" : "bg-slate-300"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${on ? "right-1" : "left-1"}`}
      />
    </button>
  );
}

export default function ControlCenter() {
  const { school, update, setFeature, reset } = useSchool();
  const enabled = FEATURES.filter((f) => school.features[f.key]).length;

  return (
    <>
      <PageHeader
        title="Control Center"
        subtitle="Customize this school's portal. Changes apply instantly."
        right={
          <button
            onClick={reset}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Reset to defaults
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal delay={0.04}>
          <Card lift={false}>
            <h2 className="font-semibold">School identity</h2>
            <p className="text-sm text-slate-500">The name, logo, and colors that students and parents see.</p>

            <label className="mt-4 block text-sm font-medium" htmlFor="school-name">
              School name
            </label>
            <input id="school-name" value={school.name} onChange={(e) => update({ name: e.target.value })} className={inputClass} />

            <label className="mt-4 block text-sm font-medium" htmlFor="school-mark">
              Logo letters
            </label>
            <input
              id="school-mark"
              value={school.mark}
              maxLength={2}
              onChange={(e) => update({ mark: e.target.value.toUpperCase() })}
              className={`${inputClass} w-24`}
            />

            <p className="mt-4 text-sm font-medium">Brand color</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {PRESETS.map((p) => {
                const active = school.brand.toLowerCase() === p.hex;
                return (
                  <motion.button
                    key={p.hex}
                    type="button"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => update({ brand: p.hex })}
                    aria-label={`${p.name} color`}
                    aria-pressed={active}
                    title={p.name}
                    style={{ backgroundColor: p.hex }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${
                      active ? "ring-2 ring-slate-900 ring-offset-2" : ""
                    }`}
                  >
                    {active ? "✓" : ""}
                  </motion.button>
                );
              })}
              <label className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
                <input
                  type="color"
                  value={school.brand}
                  onChange={(e) => update({ brand: e.target.value })}
                  aria-label="Pick a custom color"
                  className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                Custom
              </label>
            </div>
            <p className="mt-3 text-xs text-slate-400">Watch the sidebar, buttons, and cards change as you pick.</p>
          </Card>
        </Reveal>

        <Reveal delay={0.08}>
          <Card lift={false}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Features</h2>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                {enabled} of {FEATURES.length} on
              </span>
            </div>
            <p className="text-sm text-slate-500">Turn off anything your school does not need. Students stop seeing it right away.</p>
            <ul className="mt-3 divide-y divide-slate-100">
              {FEATURES.map((f) => (
                <li key={f.key} className="flex items-center gap-4 py-3">
                  <span className="text-xl">{f.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{f.label}</p>
                    <p className="text-sm text-slate-500">{f.desc}</p>
                  </div>
                  <Switch on={school.features[f.key]} onChange={(v) => setFeature(f.key, v)} label={`${f.label} on or off`} />
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>

      <Reveal delay={0.12} className="mt-6">
        <Card lift={false}>
          <h2 className="font-semibold">Coming soon</h2>
          <p className="text-sm text-slate-500">More features are on the way. Each one will get its own on and off switch here.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {COMING_SOON.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-600"
              >
                <span>{f.icon}</span>
                <span className="min-w-0 flex-1 truncate">{f.label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Soon</span>
              </div>
            ))}
          </div>
        </Card>
      </Reveal>
    </>
  );
}