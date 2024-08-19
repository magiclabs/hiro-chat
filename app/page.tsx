"use client";

import React from "react";
import { ChatWindow } from "@/components/ChatWindow";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-4xl py-12 flex flex-col stretch gap-3">
      <ChatWindow
        endpoint="api/chat"
        emoji="🏴‍☠️"
        titleText="Patchy the Chatty Pirate"
        placeholder="I'm an LLM pretending to be a pirate! Ask me about the pirate life!"
        emptyStateComponent={<></>}
      ></ChatWindow>
    </div>
  );
}
