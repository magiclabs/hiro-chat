"use client";

import { toast } from "sonner";
import { useChat } from "ai/react";
import { useEffect, useRef, type FormEvent } from "react";

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
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "api/chat",
      streamProtocol: "text",
      onError: (e) => {
        toast(e.message);
      },
    });

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const observer = new MutationObserver(() => {
        if (
          chatContainer.scrollTop + chatContainer.clientHeight >=
          chatContainer.scrollHeight - 100
        ) {
          scrollToBottom();
        }
      });
      observer.observe(chatContainer, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

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
    <Card className="flex flex-col h-[calc(100vh-4rem)]">
      <CardHeader>
        <CardTitle>{titleText}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0">
        <div ref={chatContainerRef} className="h-full p-4 overflow-y-auto">
          <div className="grid gap-4">
            {messages.length > 0
              ? messages.map((m) => (
                  <ChatMessageBubble key={m.id} message={m} />
                ))
              : null}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <form onSubmit={sendMessage} className="flex w-full space-x-2">
          <Input
            className="flex-grow"
            value={input}
            placeholder="Ask me about contracts"
            onChange={handleInputChange}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div role="status" className="flex justify-center">
                <LoadingIcon />
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
