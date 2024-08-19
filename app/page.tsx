"use client";

import React from "react";
import { ChatWindow } from "@/components/ChatWindow";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl py-12 flex flex-col stretch gap-3">
      <ChatWindow
        titleText="Magic Chat Prototype"
        placeholder="Ask me about a contract"
      />
    </div>
  );
}
