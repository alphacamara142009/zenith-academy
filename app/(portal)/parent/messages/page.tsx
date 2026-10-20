"use client";

import { Messages } from "@/components/messages";
import { PARENT_NAME } from "@/lib/chat";

export default function ParentMessages() {
  return (
    <Messages
      me={PARENT_NAME}
      side="parent"
      contacts={[
        { name: "Mr. Okafor", sub: "IT Fundamentals · Programming" },
        { name: "Ms. Hart", sub: "Algebra II A · Homeroom" },
        { name: "Ms. Brooks", sub: "English III" },
      ]}
    />
  );
}