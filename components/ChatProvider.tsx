"use client";

import { createContext, useContext, useState } from "react";
import { UseChatHelpers, UseChatOptions, useChat as useAiChat } from "ai/react";
import { MODELS } from "@/constants";
import { useContracts } from "@/utils/useContracts";
import { toast } from "sonner";

export const ChatContext = createContext<
  Pick<
    UseChatOptions & UseChatHelpers,
    "messages" | "handleInputChange" | "handleSubmit" | "isLoading" | "input"
  > & {
    modelName: string;
    clearOnChange: boolean;
    onClearMessages: () => void;
    setModelName: (name: string) => void;
    setClearOnChange: (v: boolean) => void;
  }
>({
  messages: [],
  handleInputChange: () => {},
  handleSubmit: () => {},
  isLoading: false,
  input: "",
  modelName: "",
  clearOnChange: false,
  onClearMessages: () => {},
  setModelName: () => {},
  setClearOnChange: () => {},
});

export const useChat = () => useContext(ChatContext);

const ChatProvider = ({ children }: any) => {
  const { disabledKeys } = useContracts();
  const [modelName, setModelName] = useState(MODELS["openai"][0]);
  const [clearOnChange, setClearOnChange] = useState(false);

  const chatContext = useAiChat({
    api: "api/chat",
    body: { disabledContractKeys: disabledKeys, modelName },
    streamProtocol: "text",
    onError: (e) => {
      toast(e.message);
    },
  });

  const onClearMessages = () => {
    chatContext.setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        ...chatContext,
        modelName,
        setModelName,
        clearOnChange,
        setClearOnChange,
        onClearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
