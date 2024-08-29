"use client";
import { toast } from "sonner";

import { useChat } from "ai/react";
import type { FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { LoadingIcon } from "@/components/LoadingIcon";

export function ChatWindow(props: { titleText?: string }) {
  const { titleText } = props;

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "api/chat",
      streamProtocol: "text",
      onError: (e) => {
        toast(e.message);
      },
    });

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
      </CardHeader>
      <CardContent className="flex flex-col flex-1 w-full mb-4 overflow-auto transition-[flex-grow] ease-in-out">
        <div className="grid gap-4">
          {messages.length > 0
            ? messages.map((m) => <ChatMessageBubble key={m.id} message={m} />)
            : ""}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={sendMessage} className="flex w-full flex-col">
          <div className="flex w-full mt-4">
            <Input
              className="grow mr-2 rounded"
              value={input}
              placeholder={`Ask me about contracts`}
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

              <span className={isLoading ? "hidden" : ""}>Send</span>
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
