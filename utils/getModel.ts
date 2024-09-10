import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
import { ChatTogetherAI } from "@langchain/community/chat_models/togetherai";

export function getModel(
  model: "openai" | "ollama" | "together",
  overrides: Partial<Record<keyof BaseChatModel, any>> = {},
): ChatOllama | ChatOpenAI | ChatTogetherAI {
  switch (model) {
    case "ollama":
      return new ChatOllama({
        model: "llama3.1",
        temperature: 0,
        streaming: true,
        ...overrides,
      });
    case "together":
      // For faster llama inference. and for using the larger llama 70B 405B models
      return new ChatTogetherAI({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        temperature: 0,
        streaming: true,
        ...overrides,
      });
    case "openai":
    default:
      return new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        streaming: true,
        ...overrides,
      });
  }
}
