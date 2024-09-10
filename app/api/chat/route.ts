import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";

import { getToolsFromContracts } from "@/utils/generateToolFromABI";
import { CustomParser } from "@/utils/CustomParser";
import { contractCollection } from "@/utils/collections";
import { reasoningPrompt } from "@/utils/reasoningPrompt";
import { getStructuredPrompt } from "@/utils/prompts";
import { timestampLambda } from "@/utils/timestampLambda";
import { RunnableSequence } from "@langchain/core/runnables";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const contracts = (await contractCollection.get()).filter(
      (c) => !(body.disabledContractKeys ?? []).includes(c.key),
    );
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;
    const contractAddresses = contracts.map(({ address }) => address);

    const prompt = getStructuredPrompt(previousMessages);

    try {
      // Reasoning prompt takes the contracts and chat history to asks the llm to reduce the # of abi functions
      // It returns an object of the contract and abis most appropriate to the chat history
      const reasoningPromptResponse = await reasoningPrompt({
        contracts,
        input: currentMessageContent,
        chatHistory: previousMessages,
      });

      const reducedContractAddresses = reasoningPromptResponse.map(
        ({ address }) => address,
      );

      const filteredContracts = contracts
        .filter((contract) =>
          reducedContractAddresses.includes(contract.address),
        )
        .map(({ abi, ...contract }) => {
          const matchingReducedContract = reasoningPromptResponse.find(
            (res) => res.address === contract.address,
          );

          return {
            ...contract,
            abi: matchingReducedContract?.abi ?? [],
          };
        });

      const tools = getToolsFromContracts(filteredContracts);

      const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        streaming: true,
      }).bindTools(tools);

      const stream = await RunnableSequence.from([
        timestampLambda,
        prompt,
        model,
        new CustomParser(),
      ]).stream({
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
