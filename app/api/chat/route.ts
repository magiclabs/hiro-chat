import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { getToolsFromContracts } from "@/utils/generateToolFromABI";
import { CustomParser } from "@/utils/CustomParser";
import { contractCollection } from "@/utils/collections";
import { reasoningPrompt } from "@/utils/reasoningPrompt";
import { getStructuredPrompt } from "@/utils/prompts";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const contracts = (await contractCollection.get()).filter(
      (c) => !(body.disabledContractKeys ?? []).includes(c.key),
    );
    const formattedPreviousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;
    const contractAddresses = contracts.map(({ address }) => address);

    const prompt = getStructuredPrompt(previousMessages);

    try {
      const tools = getToolsFromContracts(contracts);

      const reasoningPromptResponse = await reasoningPrompt({
        abis,
        contracts,
        newInput: currentMessageContent,
        chatHistory: previousMessages,
      });

      const tools = reasoningPromptResponse.flatMap(({ address, abi }) => {
        const contract = contracts.find(
          (contract) => contract.address === address,
        );
        if (!contract) return [];
        return abi.map(generateToolFromABI(contract));
      });

      const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        streaming: true,
      }).bindTools(tools);

      const stream = await prompt.pipe(model).pipe(new CustomParser()).stream({
        contractAddresses: contractAddresses,
        input: currentMessageContent,
      });

      return new Response(stream);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
