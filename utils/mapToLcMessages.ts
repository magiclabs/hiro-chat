import { Message as VercelChatMessage } from "ai";
import {
  SystemMessage,
  AIMessage,
  HumanMessage,
} from "@langchain/core/messages";

/**
 * Maps an array of VercelChatMessage objects to corresponding LangChain message types.
 *
 * @param {VercelChatMessage[]} messages - An array of message objects from Vercel's AI framework, where each object contains a role and content.
 * @returns {(SystemMessage|AIMessage|HumanMessage)[]} An array of LangChain message objects based on the role of each message.
 *
 * @typedef {Object} VercelChatMessage
 * @property {string} role - The role of the message (e.g., "system", "assistant", "human").
 * @property {string} content - The content of the message.
 *
 * The role is mapped to the following LangChain message types:
 * - "system" -> SystemMessage
 * - "assistant" -> AIMessage
 * - Any other role defaults to HumanMessage.
 */
export function mapToLcMessages(messages: VercelChatMessage[]) {
  return messages.map(
    ({ role, content }: { role: string; content: string }) => {
      switch (role) {
        case "system":
          return new SystemMessage(content);
        case "assistant":
          return new AIMessage(content);
        default:
          return new HumanMessage(content);
      }
    },
  );
}
