import { User, Bot } from "lucide-react";

export function UserChatBubble({ children }: React.PropsWithChildren) {
  return (
    <div className="flex items-start gap-4 justify-end">
      <div className="space-y-2 text-right max-w-[60%]">
        <div className="rounded-lg bg-muted p-3 text-sm text-primary-background">
          <p>{children}</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {/* <time dateTime="2023-08-14T12:35:12">12:35 PM</time> */}
        </div>
      </div>
      <div className="h-10 w-10 flex items-center">
        <User size={20} />
      </div>
    </div>
  );
}

export function ResponseChatBubble({ children }: React.PropsWithChildren) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 flex items-center">
        <Bot size={20} />
      </div>
      <div className="flex-1 space-y-2">
        <div className="max-w-[75%] rounded-lg p-3 text-sm">
          <p>{children}</p>
        </div>
        <div className="text-xs text-muted-foreground">
          {/* <time dateTime="2023-08-14T12:34:56">12:34 PM</time> */}
        </div>
      </div>
    </div>
  );
}
