export type Slip = { id: number; title: string; desc: string; due: string; fee: string; signedBy: string[] };

export const SLIPS_KEY = "zenith-slips";

// Demo slips. Names in signedBy are students whose parent already signed.
export const SEED_SLIPS: Slip[] = [
  {
    id: 1,
    title: "Science Museum Field Trip",
    desc: "Grade 11 trip to the Columbus science museum. Bus leaves at 8:30 AM and returns by 2:45 PM.",
    due: "2026-10-28",
    fee: "$12",
    signedBy: ["Maya Patel", "Jordan Lee", "Sofia Martinez", "Ava Nguyen", "Noah Kim"],
  },
  {
    id: 2,
    title: "Photo and Media Release",
    desc: "Lets the school share photos of your student in newsletters and on the school website.",
    due: "2026-10-23",
    fee: "Free",
    signedBy: ["Maya Patel", "Ethan Brooks", "Zoe Thompson", "Liam Carter", "Isabella Rossi", "Jordan Lee"],
  },
  {
    id: 3,
    title: "Winter Concert Participation",
    desc: "Permission for evening rehearsals on Dec 8 and Dec 10, and the concert on Dec 12.",
    due: "2026-11-20",
    fee: "Free",
    signedBy: ["Sofia Martinez"],
  },
];
