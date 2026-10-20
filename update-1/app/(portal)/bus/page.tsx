"use client";

import { PageHeader } from "@/components/ui";
import { BusTracker } from "@/components/bus";

export default function BusPage() {
  return (
    <>
      <PageHeader title="Bus Tracker" subtitle="See where your bus is and when it gets to your stop." />
      <BusTracker who="You" />
    </>
  );
}
