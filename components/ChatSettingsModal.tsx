"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "./ui/checkbox";
import { MODELS } from "@/constants";
import { findInferenceByModelName } from "@/utils/utils";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "./ui/dialog";
import { useChat } from "./ChatProvider";

type IChatSettingProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChatSettingsModal(props: IChatSettingProps) {
  const {
    modelName,
    setModelName,
    onClearMessages,
    clearOnChange,
    setClearOnChange,
  } = useChat();

  const onSetModelName = (value: string) => {
    if (clearOnChange) {
      onClearMessages();
    }
    setModelName(value);
  };

  const [inferenceProvider, setInferenceProvider] = useState(() => {
    return findInferenceByModelName(modelName);
  });

  const handleInferenceProviderChange = (value: keyof typeof MODELS) => {
    setInferenceProvider(value);
  };

  return (
    <Dialog open={props.isOpen} onOpenChange={props.onClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="flex w-full flex-col gap-4 mt-4">
          <div>
            <Label htmlFor="inferenceProvider">Inference</Label>
            <Select
              value={inferenceProvider}
              onValueChange={handleInferenceProviderChange}
            >
              <SelectTrigger id="modelName">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(MODELS).map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {inferenceProvider && (
            <div>
              <Label htmlFor="modelName">Model</Label>
              <Select value={modelName} onValueChange={onSetModelName}>
                <SelectTrigger id="modelName">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {MODELS[inferenceProvider].map((modelName) => (
                    <SelectItem key={modelName} value={modelName}>
                      {modelName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={clearOnChange}
              onCheckedChange={setClearOnChange}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Clear Chat on Model change
            </label>
          </div>

          <DialogFooter>
            <Button onClick={props.onClose}>Close</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
