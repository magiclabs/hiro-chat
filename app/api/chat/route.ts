import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";
import { AbiFunction } from "abitype";
import { z } from "zod";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { DynamicStructuredTool } from "@langchain/core/tools";

import { getAbi } from "@/utils/etherscan";
import { CustomParser } from "@/utils/CustomParser";

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
        .map(generateToolFromABI);

      const prompt = PromptTemplate.fromTemplate(TEMPLATE);
      const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        streaming: true,
      }).bindTools(tools);

      const stream = await prompt
        .pipe(model)
        .pipe(new CustomParser())
        .stream({
          chat_history: formattedPreviousMessages.join("\n"),
          input: currentMessageContent,
        });

      return new Response(stream, { status: 200 });
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

const generateToolFromABI = (func: AbiFunction): any => {
  let schema: any = {};

  func.inputs.forEach((input) => {
    if (input.type === "bool") {
      schema[input.name ?? ""] = z.boolean().describe("description");
    } else if (input.type.match(/int|fixed/)) {
      schema[input.name ?? ""] = z.number().describe("description");
    } else {
      schema[input.name ?? ""] = z.string().describe("description");
    }
  });

  return new DynamicStructuredTool({
    name: func.name,
    description: `Description for ${func.name}`,
    schema: z.object(schema),
    func: async () => {
      return "";
    },
  });
};
