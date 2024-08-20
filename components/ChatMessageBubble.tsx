import type { Message } from "ai/react";
import { useState } from "react";
import { toast } from "react-toastify";

export function ChatMessageBubble(props: {
  contractAddress: string;
  message: Message;
}) {
  const [toolCallSuccess, setToolCallSuccess] = useState(false);
  const colorClassName =
    props.message.role === "user" ? "bg-sky-600" : "bg-slate-50 text-black";
  const alignmentClassName =
    props.message.role === "user" ? "ml-auto" : "mr-auto";
  const prefix = props.message.role === "user" ? "🧑" : "👾";
  let content = {
    text: "",
    toolCall: undefined,
  };
  try {
    content = JSON.parse(props.message.content);
  } catch (e) {
    content.text = props.message.content;
    console.log(e);
  }

  const onToolCall = async (toolCall: any) => {
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
  };

  let renderContent = null;

  if (props.message.role === "user") {
    renderContent = <span>{props.message.content}</span>;
  } else {
    if (content.toolCall) {
      renderContent = (
        <>
          <span>
            I would like to make this tool call:{" "}
            {JSON.stringify(content.toolCall)}
          </span>

          <button
            className="shrink-0 px-8 py-4 bg-sky-600 rounded w-32 text-white"
            disabled={toolCallSuccess}
            onClick={() => {
              onToolCall(content.toolCall);
            }}
          >
            {toolCallSuccess ? "Success" : "Execute"}
          </button>
        </>
      );
    } else {
      renderContent = <span>{content.text}</span>;
    }
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
