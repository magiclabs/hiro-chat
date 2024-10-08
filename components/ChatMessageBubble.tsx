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
import { useContracts } from "@/utils/hooks/useContracts";
import { CHAINS } from "@/constants";
import { IContract } from "@/types";
import { usePinInput } from "./PinInput";

type IToolCall = {
  name: string;
  args: Record<string, any>;
};

const getStyleForRole = (role: Message["role"]) => {
  const colorClassName =
    role === "user"
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-primary-background";
  const alignmentClassName =
    role === "user" ? "ml-auto justify-end" : "mr-auto justify-start";
  const icon =
    role === "user" ? (
      <User strokeWidth={1.5} size={20} />
    ) : (
      <Bot strokeWidth={1.5} size={24} />
    );
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
      <div className="flex flex-col">
        <span className="break-all whitespace-pre-wrap">
          {props.message.content}
        </span>
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
  contract,
}: {
  toolCallResponse: IToolCallResponse | null;
  contract: IContract | null;
}) {
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
        {toolCallResponse.payload.transactionHash && contract && (
          <TransactionLink
            hash={toolCallResponse.payload.transactionHash}
            contract={contract}
          />
        )}
        <div className="mt-2 text-xs opacity-70 break-all">
          {toolCallResponse.message}
        </div>
        <div className="mt-2 text-xs opacity-70 break-all">
          {JSON.stringify(toolCallResponse.payload)}
        </div>
      </div>
    );
  }
  return (
    <div>
      <Badge className="bg-emerald-500">Success</Badge>
      {toolCallResponse.payload.transactionHash && contract && (
        <TransactionLink
          hash={toolCallResponse.payload.transactionHash}
          contract={contract}
        />
      )}
    </div>
  );
}

export function ToolCallMessageBubble(props: { message: Message }) {
  const [toolCallSuccess, setToolCallSuccess] = useState(false);
  const [toolCallResponse, setToolCallResponse] =
    useState<IToolCallResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { didToken } = useMagic();
  const { contracts, disabledKeys } = useContracts();
  const { colorClassName, alignmentClassName, icon } = getStyleForRole(
    props.message.role,
  );
  const { getPin, pinInput } = usePinInput();

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
      const pin = await getPin();
      if (!pin) throw new Error("Invalid PIN");
      const resp = await fetch("/api/execute", {
        method: "POST",
        body: JSON.stringify({
          toolCall,
          didToken,
          pin,
          disabledContractKeys: disabledKeys,
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
    const [key, name] = content.toolCall?.name.split("_");
    const contract = contracts.find((c) => c.key === Number(key));
    if (contract) {
      renderContent = (
        <>
          <span className="mb-2">Would you like me to execute:</span>
          <div
            title={content.toolCall?.name}
            className="mb-2 flex gap-2 items-center"
          >
            <span className="">{name}</span>
            <span className="text-xs font-mono text-muted-foreground">
              {contract.name}: {contract.address} (
              {CHAINS[contract.chainId].name})
            </span>
          </div>
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
                    <Sparkles strokeWidth={1.5} size={14} className="mr-1" />
                    Execute
                  </>
                )}
              </Button>
            ) : (
              <ToolCallSuccessBadge
                toolCallResponse={toolCallResponse}
                contract={contract}
              />
            )}
          </div>
        </>
      );
    } else {
      renderContent = <span>Bad tool call: {content.toolCall?.name}</span>;
    }
  } else {
    renderContent = <span>{content.text}</span>;
  }

  return (
    <>
      <div
        className={`${alignmentClassName} ${colorClassName} rounded p-2 max-w-[80%] flex`}
      >
        <div className="mr-2">{icon}</div>
        <div className="pr-6 break-anywhere whitespace-pre-wrap flex flex-col">
          {renderContent}
        </div>
      </div>

      {pinInput}
    </>
  );
}

export function ChatMessageBubble(props: { message: Message }) {
  switch (props.message.role) {
    case "user":
      return <UserChatBubble {...props} />;
    case "assistant":
      return <ToolCallMessageBubble {...props} />;
  }
}

const TransactionLink = (props: { hash: string; contract: IContract }) => {
  const uri = CHAINS[props.contract.chainId].explorerURI;
  return (
    <div className="mt-2 text-xs opacity-70 break-all">
      <Link target="_blank" href={`${uri}/${props.hash}`} className="underline">
        View your Transaction
      </Link>
    </div>
  );
};
