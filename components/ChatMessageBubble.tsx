import type { Message } from "ai/react";
import Link from "next/link";
import { User, Bot, Sparkles } from "lucide-react";

import { LoadingIcon } from "./LoadingIcon";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useMagic } from "./MagicProvider";
import { Badge } from "./ui/badge";
import { ToolArgsTable } from "./ToolArgsTable";

type IToolCall = {
  name: string;
  args: Record<string, any>;
};

const getStyleForRole = (role: Message["role"]) => {
  const colorClassName =
    role === "user"
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-primary-background";
  const alignmentClassName = role === "user" ? "ml-auto" : "mr-auto";
  const icon = role === "user" ? <User size={20} /> : <Bot size={24} />;
  return {
    colorClassName,
    alignmentClassName,
    icon,
  };
};

export function UserChatBubble(props: { message: Message }) {
  const { colorClassName, alignmentClassName, icon } = getStyleForRole(
    props.message.role,
  );

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded p-2 max-w-[80%] flex`}
    >
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>
      </div>
      <div className="ml-2">{icon}</div>
    </div>
  );
}

type IToolCallResponse = {
  message: string;
  status: string;
  payload: Record<string, any>;
};

function ToolCallSuccessBadge({
  toolCallResponse,
}: {
  toolCallResponse: IToolCallResponse | null;
}) {
  // Hack to just get around ts for now.
  if (!toolCallResponse)
    return (
      <div>
        <Badge className="bg-zinc-500">Unknown Error</Badge>
      </div>
    );

  if (toolCallResponse.status !== "success") {
    return (
      <div>
        <Badge className="bg-rose-500">Error</Badge>
        <br />
        <span className="mt-2 text-xs opacity-70 break-all">
          {toolCallResponse.message}
        </span>
        <br />
        <span className="mt-2 text-xs opacity-70 break-all">
          {JSON.stringify(toolCallResponse.payload)}
        </span>
      </div>
    );
  }
  return (
    <div>
      <Badge className="bg-emerald-500">Success</Badge>
      <span className="mt-2 text-xs opacity-70 break-all">
        {toolCallResponse.payload.transactionHash && (
          <div className="mt-2">
            <Link
              target="_blank"
              href={`https://sepolia.etherscan.io/tx/${toolCallResponse.payload.transactionHash}`}
              className="underline"
            >
              View your Transaction
            </Link>
          </div>
        )}
      </span>
    </div>
  );
}

export function ToolCallMessageBubble(props: {
  contractAddress: string;
  network?: string | null;
  message: Message;
}) {
  const [toolCallSuccess, setToolCallSuccess] = useState(false);
  const [toolCallResponse, setToolCallResponse] =
    useState<IToolCallResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { didToken } = useMagic();

  const { colorClassName, alignmentClassName, icon } = getStyleForRole(
    props.message.role,
  );

  let content: { text: string; toolCall?: IToolCall } = {
    text: "",
    toolCall: undefined,
  };
  try {
    content = JSON.parse(props.message.content);
  } catch (e) {
    content.text = props.message.content;
  }

  const onToolCall = async (toolCall?: IToolCall) => {
    if (!toolCall) return;

    setLoading(true);
    try {
      const resp = await fetch("/api/execute", {
        method: "POST",
        body: JSON.stringify({
          toolCall,
          contractAddress: props.contractAddress,
          network: props.network,
          didToken,
        }),
      });

      if (resp.status === 200) {
        const data = await resp.text();
        setToolCallSuccess(true);
        setToolCallResponse(JSON.parse(data));
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
        <div>
          {!toolCallSuccess ? (
            <Button
              className="rounded-full text-xs font-semibold"
              disabled={loading || toolCallSuccess}
              onClick={() => {
                onToolCall(content.toolCall);
              }}
            >
              {loading ? (
                <LoadingIcon />
              ) : (
                <>
                  <Sparkles size={14} className="mr-1" /> Execute
                </>
              )}
            </Button>
          ) : (
            <ToolCallSuccessBadge toolCallResponse={toolCallResponse} />
          )}
        </div>
      </>
    );
  } else {
    renderContent = <span>{content.text}</span>;
  }

  return (
    <>
      <div
        className={`${alignmentClassName} ${colorClassName} rounded p-2 max-w-[80%] flex`}
      >
        <div className="mr-2">{icon}</div>
        <div className="pr-6 whitespace-pre-wrap flex flex-col">
          {renderContent}
        </div>
      </div>
    </>
  );
}

export function ChatMessageBubble(props: {
  contractAddress: string;
  network?: string | null;
  message: Message;
}) {
  switch (props.message.role) {
    case "user":
      return <UserChatBubble {...props} />;
    case "assistant":
      return <ToolCallMessageBubble {...props} />;
  }
}
