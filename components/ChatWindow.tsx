"use client";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useChat } from "ai/react";
import { useState, useCallback } from "react";
import type { FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { LoadingIcon } from "@/components/LoadingIcon";
import Link from "next/link";

export function ChatWindow(props: { titleText?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const contractAddress = searchParams.get("contractAddress");
  // const [contractAddress, setContractAddress] = useState(""); // 0xbd3531da5cf5857e7cfaa92426877b022e612cf8
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
    onError: (e) => {
      toast(e.message, { theme: "dark" });
    },
  });

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  const _setContractAddress = (e: any) => {
    e.preventDefault();
    router.push(
      pathname +
        "?" +
        createQueryString("contractAddress", e.nativeEvent.target?.[0]?.value),
    );
    setInput("");
  };

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (isLoading) {
      return;
    }
    handleSubmit(e);
  }

  return (
    <Card className="grow flex flex-col">
      <CardHeader>
        <CardTitle>{titleText}</CardTitle>
        {contractAddress ? (
          <CardDescription className="underline">
            <Link href={"/"}>Change contract</Link>
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col flex-1 w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out">
        <div className="grid gap-4">
          {messages.length > 0
            ? [...messages].map((m, i) => {
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
              className="grow mr-2 rounded"
              value={input}
              placeholder={
                contractAddress
                  ? `Ask me about contract ${contractAddress}`
                  : "Enter a contract address"
              }
              onChange={handleInputChange}
            />
            <Button type="submit" disabled={isLoading}>
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
