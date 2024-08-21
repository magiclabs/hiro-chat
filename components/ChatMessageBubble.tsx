import type { Message } from "ai/react";
import { User, Bot } from "lucide-react";

import { LoadingIcon } from "./LoadingIcon";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { useMagic } from "./MagicProvider";
import { Badge } from "./ui/badge";
import { ToolArgsTable } from "./ToolArgsTable";

const getStyleForRole = (role: Message["role"]) => {
  const colorClassName =
    role === "user"
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-primary-background";
  const alignmentClassName = role === "user" ? "ml-auto" : "mr-auto";
  const prefix = role === "user" ? <User /> : <Bot />;
  return {
    colorClassName,
    alignmentClassName,
    prefix,
  };
};

export function UserChatBubble(props: { message: Message }) {
  const { colorClassName, alignmentClassName, prefix } = getStyleForRole(
    props.message.role,
  );

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded p-2 max-w-[80%] flex`}
    >
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>
      </div>
      <div className="ml-2">{prefix}</div>
    </div>
  );
}

export function ToolCallMessageBubble(props: {
  contractAddress: string;
  message: Message;
}) {
  const [toolCallSuccess, setToolCallSuccess] = useState(false);
  const [toolCallResponse, setToolCallResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { didToken } = useMagic();

  const { colorClassName, alignmentClassName, prefix } = getStyleForRole(
    props.message.role,
  );

  let content = {
    text: "",
    toolCall: undefined,
  };
  try {
    content = JSON.parse(props.message.content);
  } catch (e) {
    content.text = props.message.content;
  }

  const onToolCall = async (toolCall: any) => {
    setLoading(true);
    try {
      const resp = await fetch("/api/execute", {
        method: "POST",
        body: JSON.stringify({
          toolCall,
          contractAddress: props.contractAddress,
          didToken,
        }),
      });

      if (resp.status === 200) {
        const text = await resp.text();
        setToolCallSuccess(true);
        setToolCallResponse(text);
      } else {
        const json = await resp.json();
        toast(`error: ${json.error}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast(`Error: ${error.message}`);
      } else {
        toast("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  let renderContent = null;

  if (content.toolCall) {
    renderContent = (
      <>
        <span className="mb-2">
          Would you like me to execute: {content.toolCall?.name}
        </span>
        <span className="mb-2">
          <ToolArgsTable args={content.toolCall.args} />

        </span>

        {(!loading && !toolCallSuccess) ? (
        <Button
          className="flex w-32 justify-center"
          disabled={loading || toolCallSuccess}
          onClick={() => {
            onToolCall(content.toolCall);
          }}
        >
          {loading ? <LoadingIcon /> : toolCallSuccess ? "Success" : "Execute"}
        </Button>
        ): (
          <span>
            {loading ? (
              <Badge>Executing</Badge>
            ):(
              <>
                <Badge className="bg-emerald-500">Success</Badge>
                <span className="mt-2 text-xs opacity-70 break-all">
                  {toolCallResponse}
                </span>
              </>
            )}
          </span>
        )}
      </>
    );
  } else {
    renderContent = <span>{content.text}</span>;
  }

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded p-2 max-w-[80%] flex`}
    >
      <div className="mr-2">{prefix}</div>
      <div className="whitespace-pre-wrap flex flex-col">{renderContent}</div>
    </div>
  );
}

export function ChatMessageBubble(props: {
  contractAddress: string;
  message: Message;
}) {
  switch (props.message.role) {
    case "user":
      return <UserChatBubble {...props} />;
    case "assistant":
      return <ToolCallMessageBubble {...props} />;
  }
}
