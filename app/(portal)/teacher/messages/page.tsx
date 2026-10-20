"use client";

import { Messages } from "@/components/messages";
import { TEACHER } from "@/lib/demo";

export default function TeacherMessages() {
  return (
    <Messages
      me={TEACHER.name}
      side="teacher"
      contacts={[
        { name: "Dana Rivera", sub: "Parent of Alex Rivera" },
        { name: "Chris Patel", sub: "Parent of Maya Patel" },
      ]}
    />
  );
}