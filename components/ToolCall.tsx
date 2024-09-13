"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

export function ToolCall({ name, args }: { name: string; args: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const parseJSON = (data: any) => {
    try {
      return typeof data === "string" ? JSON.parse(data) : data;
    } catch {
      return data;
    }
  };

  const parsedArgs = parseJSON(args);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-md p-2 mb-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Expand to see details</span>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-semibold bg-muted rounded-md">
                Tool: {name}
              </span>
              <h4 className="text-sm font-semibold">Arguments:</h4>
              <pre className="text-sm bg-muted p-2 rounded-md overflow-x-auto">
                {JSON.stringify(parsedArgs, null, 2)}
              </pre>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
