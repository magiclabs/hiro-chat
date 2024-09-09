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
import { Label } from "./ui/label";
import { CornerDownLeft, Trash2 } from "lucide-react";
import { ConfirmAlert } from "./ConfirmAlert";
import { useContracts } from "@/utils/useContracts";

export function ChatWindow(props: { titleText?: string }) {
  const { titleText } = props;
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { disabledKeys } = useContracts();
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
  } = useChat({
    api: "api/chat",
    body: { disabledContractKeys: disabledKeys },
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

  const onClearMessages = () => {
    setMessages([]);
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-6rem)] border-none shadow-none">
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
      <CardFooter>
        <form
          onSubmit={sendMessage}
          className="w-full relative overflow-hidden rounded-lg border bg-background"
        >
          <Label htmlFor="message" className="sr-only">
            Message
          </Label>
          <Input
            id="message"
            className="min-h-12 border-0 p-3 pb-2 shadow-none focus-visible:ring-0"
            value={input}
            placeholder="Type your message here..."
            onChange={handleInputChange}
          />
          <div className="flex items-center p-2 pt-0">
            <ConfirmAlert
              onConfirm={onClearMessages}
              description="This will clear out your chat history"
              button={
                <Button variant="ghost" size="icon" title="Clear messages">
                  <Trash2 strokeWidth={1.5} size={20} />
                  <span className="sr-only">Clear messages</span>
                </Button>
              }
            />
            <Button
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <div role="status" className="flex justify-center">
                  <LoadingIcon />
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <>
                  Send
                  <CornerDownLeft strokeWidth={1.5} size={20} />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  );
}
