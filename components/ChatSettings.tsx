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
import { findModelKey } from "@/utils/utils";

type IChatSettingProps = {
  clearOnChange: boolean;
  onClearOnChange: (value: boolean) => void;
  modelName: string;
  onModelNameChange: (value: string) => void;
};

export function ChatSettings(props: IChatSettingProps) {
  const { modelName, onModelNameChange, clearOnChange, onClearOnChange } =
    props;
  const [inferenceProvider, setInferenceProvider] = useState(() => {
    return findModelKey(modelName);
  });

  const handleInferenceProviderChange = (value: keyof typeof MODELS) => {
    setInferenceProvider(value);
  };

  return (
    <div className="w-80 border-l p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Settings</h3>
      <div className="space-y-4">
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
            <Select value={modelName} onValueChange={onModelNameChange}>
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
            onCheckedChange={onClearOnChange}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Clear Chat on Model change
          </label>
        </div>
      </div>
    </div>
  );
}
