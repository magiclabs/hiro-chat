import { BaseChatModelParams } from "@langchain/core/language_models/chat_models";
import { ChatOllama, ChatOllamaInput } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { findInferenceByModelName } from "./utils";

type ModelMapping = {
  openai: ChatOpenAI;
  ollama: ChatOllama;
  together: ChatTogetherAI;
};

export function getModel(
  modelName: string,
  overrides: BaseChatModelParams | ChatOllamaInput = {},
): ModelMapping[keyof ModelMapping] {
  const inference = findInferenceByModelName(modelName);
  if (inference === "ollama") {
    return new ChatOllama({
      model: modelName,
      temperature: 0,
      streaming: true,
      ...overrides,
    });
  }

  if (inference === "together") {
    return new ChatTogetherAI({
      model: modelName,
      temperature: 0,
      streaming: true,
      ...overrides,
    });
  }

  return new ChatOpenAI({
    model: modelName,
    temperature: 0,
    streaming: true,
    ...overrides,
  });
}
