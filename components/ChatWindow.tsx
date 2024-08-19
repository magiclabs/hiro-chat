"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useChat } from "ai/react";
import { useRef } from "react";
import type { FormEvent } from "react";

import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { LoadingIcon } from "@/components/LoadingIcon";

export function ChatWindow(props: {
  placeholder?: string;
  titleText?: string;
}) {
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const { placeholder, titleText } = props;

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "api/chat",
      streamMode: "text",
      body: {
        contractAddress: "0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
      },
      onResponse(response) {
        console.log({ response });
      },
      onError: (e) => {
        toast(e.message, { theme: "dark" });
      },
    });

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (isLoading) {
      return;
    }
    handleSubmit(e);
  }

  return (
    <div
      className={`flex flex-col items-center p-4 md:p-8 rounded grow overflow-hidden border`}
    >
      <h2 className={`text-2xl`}>{titleText}</h2>

      <div
        className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out"
        ref={messageContainerRef}
      >
        {messages.length > 0
          ? [...messages].reverse().map((m, i) => {
              return <ChatMessageBubble key={m.id} message={m} />;
            })
          : ""}
      </div>

      <form onSubmit={sendMessage} className="flex w-full flex-col">
        <div className="flex w-full mt-4">
          <input
            className="grow mr-8 p-4 rounded"
            value={input}
            placeholder={placeholder ?? "What's it like to be a pirate?"}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="shrink-0 px-8 py-4 bg-sky-600 rounded w-28"
          >
            <div
              role="status"
              className={`${isLoading ? "" : "hidden"} flex justify-center`}
            >
              <LoadingIcon />
              <span className="sr-only">Loading...</span>
            </div>

            <span className={isLoading ? "hidden" : ""}>Send</span>
          </button>
        </div>
      </form>

      <ToastContainer />
    </div>
  );
}
