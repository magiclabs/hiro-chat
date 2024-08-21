"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useChat } from "ai/react";
import { useRef, useState } from "react";
import type { FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { LoadingIcon } from "@/components/LoadingIcon";

export function ChatWindow(props: { titleText?: string }) {
  const [contractAddress, setContractAddress] = useState(""); // 0xbd3531da5cf5857e7cfaa92426877b022e612cf8
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const { titleText } = props;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
  } = useChat({
    api: "api/chat",
    streamProtocol: "text",
    body: { contractAddress },
    // onResponse(response) {
    //   console.log({ response });
    // },
    onError: (e) => {
      toast(e.message, { theme: "dark" });
    },
  });
  const _setContractAddress = (e: any) => {
    e.preventDefault();
    setContractAddress(e.nativeEvent.target?.[0]?.value);
    setInput("");
  };

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
    <Card>
      <CardHeader>
        <h2 className={`text-2xl mb-6`}>{titleText}</h2>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col-reverse w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out"
          ref={messageContainerRef}
        >
          {messages.length > 0
            ? [...messages].reverse().map((m, i) => {
                return (
                  <ChatMessageBubble
                    key={m.id}
                    contractAddress={contractAddress}
                    message={m}
                  />
                );
              })
            : ""}
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={contractAddress ? sendMessage : _setContractAddress}
          className="flex w-full flex-col"
        >
          <div className="flex w-full mt-4">
            <Input
              className="grow mr-8 p-4 rounded"
              value={input}
              placeholder={
                contractAddress
                  ? `Ask me about contract ${contractAddress}`
                  : "Enter a contract address"
              }
              onChange={handleInputChange}
            />
            <Button
              type="submit"
              // className="shrink-0 px-8 py-4 bg-sky-600 rounded w-28 disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              <div
                role="status"
                className={`${isLoading ? "" : "hidden"} flex justify-center`}
              >
                <LoadingIcon />
                <span className="sr-only">Loading...</span>
              </div>

              <span className={isLoading ? "hidden" : ""}>
                {contractAddress ? "Send" : "Set"}
              </span>
            </Button>
          </div>
        </form>
      </CardFooter>

      <ToastContainer />
    </Card>
  );
}
