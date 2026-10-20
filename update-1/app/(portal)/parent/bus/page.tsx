"use client";

import { PageHeader } from "@/components/ui";
import { BusTracker } from "@/components/bus";

export default function ParentBusPage() {
  return (
    <>
      <PageHeader title="Bus Tracker" subtitle="See where Alex's bus is and when it reaches your stop." />
      <BusTracker who="Alex" />
    </>
  );
}
