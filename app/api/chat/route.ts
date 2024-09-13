import { NextRequest, NextResponse } from "next/server";
import { getToolsFromContracts } from "@/utils/generateToolFromABI";
import { CustomParser } from "@/utils/CustomParser";
import { contractCollection } from "@/utils/collections";
import { reasoningPrompt } from "@/utils/reasoningPrompt";
import { getStructuredPrompt } from "@/utils/prompts";
import { getTimestampLambda } from "@/utils/timestampLambda";
import { RunnableSequence } from "@langchain/core/runnables";
import { MODELS } from "@/constants";
import { getModel } from "@/utils/getModel";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { formatAbi, parseAbi } from "abitype";
import { timeStamp } from "console";

export const runtime = "nodejs";

const basicTool = new DynamicStructuredTool({
  name: "random-number-generator",
  description: "generates a random number between two input numbers",
  schema: z.object({
    low: z.number().describe("The lower bound of the generated number"),
    high: z.number().describe("The upper bound of the generated number"),
  }),
  func: async ({ low, high }) =>
    (Math.random() * (high - low) + low).toString(), // Outputs still must be strings
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const modelName = body.modelName ?? MODELS["openai"][0];
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
        modelName: modelName,
        contracts,
        input: currentMessageContent,
        chatHistory: previousMessages,
      });

      // contracts[0].abi = contracts[0].abi?.filter(
      //   (i) => i.name === "transferFrom",
      // );
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

      const filteredContractTools = getToolsFromContracts(filteredContracts);
      const contractTools = getToolsFromContracts(contracts);

      console.log({
        filteredContractTools: filteredContractTools.length,
        contractTools: contractTools.length,
      });
      const tools = [...filteredContractTools];
      const model = getModel(modelName);
      const modelWithTool = model.bindTools(tools);

      const stream = await RunnableSequence.from([
        getTimestampLambda(modelName),
        prompt,
        modelWithTool,
        new CustomParser({ prefix: `Main Prompt ${Math.random()}` }),
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
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
