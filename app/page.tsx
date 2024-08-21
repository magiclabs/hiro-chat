"use client";

import React from "react";
import { ChatWindow } from "@/components/ChatWindow";

export default function Page() {
  return (
    <div className="flex flex-1">
      {/* Uncomment to add side nav */}
      {/* <div className="hidden w-96 flex-col border-r bg-card p-4 sm:flex">
        <div className="mb-4 flex items-center justify-between">
        </div>
        </div> */}

      {/* Remove div with id=temp if enabling side nav */}
      <div
        id="temp"
        className="mx-auto w-full max-w-4xl py-12 flex flex-col stretch gap-3"
      >
        <div className="flex flex-1 flex-col">
          <ChatWindow titleText="Magic Chat Prototype" />
        </div>
      </div>
    </div>
  );
}
