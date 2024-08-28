"use client";
import {
  useSearchParams,
  usePathname,
  useRouter,
  ReadonlyURLSearchParams,
} from "next/navigation";
import { toast } from "sonner";

import { useChat } from "ai/react";
import { useEffect } from "react";
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

const createQueryString = (
  currentSearchParams: ReadonlyURLSearchParams,
  name: string,
  value: string,
) => {
  const params = new URLSearchParams(currentSearchParams.toString());
  params.set(name, value);
  return params.toString();
};

export function ChatWindow(props: { titleText?: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const contractAddresses = searchParams.get("contractAddresses");
  const network = searchParams.get("network");
  const { titleText } = props;

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setInput,
    setMessages,
  } = useChat({
    api: "api/chat",
    streamProtocol: "text",
    body: { contractAddresses, network },
    onError: (e) => {
      toast(e.message);
    },
  });

  // If the query
  useEffect(() => {
    setMessages([]);
  }, [setMessages, contractAddresses]);

  const _setContractAddress = (e: any) => {
    e.preventDefault();
    router.push(
      pathname +
        "?" +
        createQueryString(
          searchParams,
          "contractAddresses",
          e.nativeEvent.target?.[0]?.value,
        ),
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
        {contractAddresses ? (
          <CardDescription className="underline">
            <Link href={"/"}>Change contracts</Link>
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col flex-1 w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out">
        <div className="grid gap-4">
          {messages.length > 0
            ? messages.map((m) => {
                return (
                  <ChatMessageBubble key={m.id} network={network} message={m} />
                );
              })
            : ""}
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={contractAddresses ? sendMessage : _setContractAddress}
          className="flex w-full flex-col"
        >
          <div className="flex w-full mt-4">
            <Input
              className="grow mr-2 rounded"
              value={input}
              placeholder={
                contractAddresses
                  ? `Ask me about contracts ${contractAddresses}`
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
                {contractAddresses ? "Send" : "Set"}
              </span>
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
