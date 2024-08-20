import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

import { getAbi } from "@/utils/etherscan";
import { generateToolFromABI } from "@/utils/generateToolFromABI";

export const runtime = "nodejs";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const contractAddress = body.contractAddress ?? "";
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    const TEMPLATE = `You are to interact with a smart contract on behalf of the user. The smart contract address is ${contractAddress}. You will be provided with functions that represent the functions in the ABI the user can call. Based on the user's prompt, determine what function they are trying to call, and extract the appropriate inputs.

Current conversation:
{chat_history}

User: {input}
AI:`;

    try {
      const abi = await getAbi(contractAddress);
      const tools = JSON.parse(abi)
        .filter((f: any) => f.name && f.type === "function")
        .map(generateToolFromABI(contractAddress));

      const prompt = PromptTemplate.fromTemplate(TEMPLATE);
      const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        streaming: true,
      }).bindTools(tools);

      const resp = await prompt.pipe(model).invoke({
        chat_history: formattedPreviousMessages.join("\n"),
        input: currentMessageContent,
      });

      const toolCall = resp.tool_calls?.[0];

      return new Response(
        JSON.stringify({
          text: resp.content as string,
          toolCall: toolCall,
        }),
      );
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
