import { BaseChatModelParams } from "@langchain/core/language_models/chat_models";
import { ChatOllama, ChatOllamaInput } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { findInferenceByModelName } from "./utils";

type ModelMapping = {
  openai: ChatOpenAI;
  ollama: ChatOllama;
  together: ChatTogetherAI;
  fireworks: ChatFireworks;
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

  if (inference === "fireworks") {
    return new ChatFireworks({
      model: modelName,
      temperature: 0,
      maxTokens: undefined,
      timeout: undefined,
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

export function applyStructuredOutput(
  model: ModelMapping[keyof ModelMapping],
  schema: ChatOpenAI["withStructuredOutput"],
) {
  if (model instanceof ChatOllama) {
    return model.withStructuredOutput(schema);
  }
  if (model instanceof ChatFireworks) {
    return model.withStructuredOutput(schema);
  }
  return model.withStructuredOutput(schema, { strict: true });
}
