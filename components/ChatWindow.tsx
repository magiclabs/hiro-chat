"use client";

import { toast } from "sonner";
import { useChat } from "ai/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ChatMessageBubble } from "@/components/ChatMessageBubble";
import { LoadingIcon } from "@/components/LoadingIcon";
import { Label } from "@/components/ui/label";
import { CornerDownLeft, Trash2 } from "lucide-react";
import { ConfirmAlert } from "./ConfirmAlert";
import { useContracts } from "@/utils/useContracts";
import { ChatSettings } from "./ChatSettings";
import { MODELS } from "@/constants";

export function ChatWindow(props: {
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
}) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { disabledKeys } = useContracts();
  const [modelName, setModelName] = useState(MODELS["openai"][0]);
  const [clearOnChange, setClearOnChange] = useState(false);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    isLoading,
  } = useChat({
    api: "api/chat",
    body: { disabledContractKeys: disabledKeys, modelName },
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

  const onModelNameChange = (value: string) => {
    if (clearOnChange) {
      onClearMessages();
    }
    setModelName(value);
  };

  return (
    <div className="flex border-t">
      <Card className="flex grow flex-col h-[calc(100vh-6rem)] border-none shadow-none">
        <CardContent className="flex-grow overflow-hidden p-0">
          <div className="flex h-full">
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
              <div className="grid gap-4">
                {messages.length > 0
                  ? messages.map((m) => (
                      <ChatMessageBubble key={m.id} message={m} />
                    ))
                  : null}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pb-0">
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
      <ChatSettings
        isOpen={props.isSettingsOpen}
        onClose={props.onCloseSettings}
        clearOnChange={clearOnChange}
        onClearOnChange={setClearOnChange}
        modelName={modelName}
        onModelNameChange={onModelNameChange}
      />
    </div>
  );
}
