"use client";

import React from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { useMagic } from "@/components/MagicProvider";
import { LoadingIcon } from "@/components/LoadingIcon";
import { Button } from "@/components/ui/button";

export default function Page() {
  const { isLoggedIn, handleLogin, handleLogout, isLoading } = useMagic();

  return (
    <div className="flex flex-1">
      {isLoading ? (
        <div className="flex-1 h-screen items-center flex justify-center">
          <LoadingIcon className="text-black" />
        </div>
      ) : isLoggedIn ? (
        <>
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

              <div className="flex mt-4 justify-end">
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 h-screen items-center flex justify-center">
          <Button onClick={handleLogin}>Login</Button>
        </div>
      )}
    </div>
  );
}
