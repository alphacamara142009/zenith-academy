"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui";

export default function ComingSoon() {
  const { section } = useParams<{ section: string }>();
  return (
    <>
      <PageHeader title={section.charAt(0).toUpperCase() + section.slice(1)} subtitle="This page is being built next." />
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">Coming in the next update</div>
    </>
  );
}
