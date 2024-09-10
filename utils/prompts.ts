import { Message as VercelChatMessage } from "ai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { mapToLcMessages } from "./mapToLcMessages";

export const getStructuredPrompt = (chatHistory: VercelChatMessage[]) => {
  const chatHistoryAsMessages = mapToLcMessages(chatHistory);

  return ChatPromptTemplate.fromMessages([
    {
      type: "system",
      content:
        "You are to interact with smart contracts on behalf of the user. The smart contract addresses are {contractAddresses}. You will be provided with functions that represent the functions in the ABI the user can call. Based on the user's prompt, determine what function they are trying to call, and extract the appropriate inputs. If there is ambiguity about which contract they want to call the function on, ask for clarification.",
    },
    ...chatHistoryAsMessages,
    {
      type: "user",
      content: "{input}",
    },
  ]);
};
