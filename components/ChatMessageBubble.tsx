import type { Message } from "ai/react";
import { LoadingIcon } from "./LoadingIcon";
import { useState } from "react";
import { toast } from "react-toastify";

const getStyleForRole = (role: Message["role"]) => {
  const colorClassName =
    role === "user" ? "bg-sky-600" : "bg-slate-50 text-black";
  const alignmentClassName = role === "user" ? "ml-auto" : "mr-auto";
  const prefix = role === "user" ? "🧑" : "👾";
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
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
    >
      <div className="mr-2">{prefix}</div>
      <div className="whitespace-pre-wrap flex flex-col">
        <span>{props.message.content}</span>
      </div>
    </div>
  );
}

export function ToolCallMessageBubble(props: {
  contractAddress: string;
  message: Message;
}) {
  const [toolCallSuccess, setToolCallSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
        }),
      });

      if (resp.status === 200) {
        setToolCallSuccess(true);
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
        <span>
          I would like to make this tool call:{" "}
          {JSON.stringify(content.toolCall)}
        </span>

        <button
          className="flex shrink-0 p-4 bg-sky-600 rounded w-32 text-white disabled:bg-gray-500 disabled:cursor-not-allowed justify-center"
          disabled={loading || toolCallSuccess}
          onClick={() => {
            onToolCall(content.toolCall);
          }}
        >
          {loading ? <LoadingIcon /> : toolCallSuccess ? "Success" : "Execute"}
        </button>
      </>
    );
  } else {
    renderContent = <span>{content.text}</span>;
  }

  return (
    <div
      className={`${alignmentClassName} ${colorClassName} rounded px-4 py-2 max-w-[80%] mb-8 flex`}
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
