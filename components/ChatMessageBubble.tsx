import type { Message } from "ai/react";

export function ChatMessageBubble(props: { message: Message }) {
  const colorClassName =
    props.message.role === "user" ? "bg-sky-600" : "bg-slate-50 text-black";
  const alignmentClassName =
    props.message.role === "user" ? "ml-auto" : "mr-auto";
  const prefix = props.message.role === "user" ? "🧑" : "👾";
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
