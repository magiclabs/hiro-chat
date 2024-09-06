import { Message as VercelChatMessage } from "ai";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { mapToLcMessages } from "./mapToLcMessages";

export const singlePrompt = async (chatHistory: VercelChatMessage[]) => {
  const formattedPreviousMessages = chatHistory.map((message) => {
    return `${message.role}: ${message.content}`;
  });

  const template = `You are to interact with smart contracts on behalf of the user. The smart contract addresses are {contractAddresses}. You will be provided with functions that represent the functions in the ABI the user can call. Based on the user's prompt, determine what function they are trying to call, and extract the appropriate inputs. If there is ambiguity about which contract they want to call the function on, ask for clarification.

    Current conversation:
    {chatHistory}
    
    User: {input}
    AI:`;
  const prompt = await PromptTemplate.fromTemplate(template).partial({
    chatHistory: formattedPreviousMessages.join("\n"),
  });

  return prompt;
};

export const structuredPrompt = (chatHistory: VercelChatMessage[]) => {
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
