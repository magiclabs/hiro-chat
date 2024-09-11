import { BaseChatModelParams } from "@langchain/core/language_models/chat_models";
import { ChatOllama, ChatOllamaInput } from "@langchain/ollama";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatOpenAI } from "@langchain/openai";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";

type ModelMapping = {
  openai: ChatOpenAI;
  ollama: ChatOllama;
  together: ChatTogetherAI;
  fireworks: ChatFireworks;
};

export function getModel<T extends keyof ModelMapping>(
  model: T,
  overrides: BaseChatModelParams | ChatOllamaInput = {},
): ModelMapping[T] {
  switch (model) {
    case "ollama":
      return new ChatOllama({
        model: "llama3.1",
        temperature: 0,
        streaming: true,
        ...overrides,
      }) as ModelMapping[T];
    case "fireworks":
      return new ChatFireworks({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        temperature: 0,
        streaming: true,
        ...overrides,
      }) as ModelMapping[T];

    case "together":
      return new ChatTogetherAI({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        temperature: 0,
        streaming: true,
        ...overrides,
      }) as ModelMapping[T];
    case "openai":
    default:
      return new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        streaming: true,
        ...overrides,
      }) as ModelMapping[T];
  }
}
