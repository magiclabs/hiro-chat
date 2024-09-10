import { IContract } from "@/types";
import { SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { AbiFunction, formatAbi, parseAbi } from "abitype";
import { z } from "zod";
import { RunnableSequence } from "@langchain/core/runnables";
import { Message as VercelChatMessage } from "ai";
import { mapToLcMessages } from "./mapToLcMessages";

export type IReasoningPromptResponse = {
  address: string;
  abi: AbiFunction[];
}[];

const structuredOutputSchema = z
  .array(
    z.object({
      address: z
        .string()
        .describe(
          "The contract address that has a function that could be used",
        ),
      functionSignatures: z
        .array(z.string())
        .describe("The functions from contract address that applies"),
    }),
  )
  .describe(
    "An array of objects containing the contract address and list of applicable functions. If no reasonable match found this can be empty",
  );

const trimIfStartsWith = (str: string, prefix: string) => {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length);
  } else {
    return str;
  }
};

export async function reasoningPrompt({
  input,
  contracts,
  chatHistory,
}: {
  input: string;
  contracts: IContract[];
  chatHistory: VercelChatMessage[];
}): Promise<IReasoningPromptResponse> {
  // Reduce contract.abi to just functions
  const contractFunctions = contracts
    .filter(({ abi }) => abi?.length)
    .map(({ abi, ...contract }) => {
      return {
        ...contract,
        abi: abi?.filter((f: any) => f.name && f.type === "function"),
      };
    });

  // Generate a readable string of functions from the items in the abi array
  const readableAbiFunction = contractFunctions
    .map(({ address, name, abi }) => {
      // Convert abi object to string. Remove the word function to reduce token use
      const abiFunctions = formatAbi(abi ?? []).map((func) =>
        trimIfStartsWith(func, "function "),
      );

      return `${name}:${address}\n${abiFunctions.join("\n")}`;
    })
    .join("\n");

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    streaming: true,
  }).withStructuredOutput(
    z.object({
      results: structuredOutputSchema,
    }),
    {
      strict: true,
    },
  );

  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      [
        "You're an assistant whose tasked with narrowing the list of smart contracts and their associated functions signatures that you think apply given the conversation provided.",
        "You will be provided with a list functions the user can call.",
        "Based on the user's prompt, determine what functions they are trying to call. It can be fuzzy match",
        "There can be multiple functions across multiple contracts that apply to the user's input.",
        "Do not try to parse, understand, confirm, or interpret function inputs from the user's query. A second assistant will determine that.",
        "The following is a list of abi's and their functions (in the format {contract name}:{address} followed by the list of function underneath it):",
      ].join(" "),
    ),
    {
      type: "system",
      content:
        "\nStart of ABI Functions\n{abiContext}\n End of ABI functions\n",
    },
    ...mapToLcMessages(chatHistory),
    { type: "human", content: "{input}" },
  ]);
  const chain = RunnableSequence.from([prompt, model]);

  try {
    const answer = await chain.invoke({
      input,
      abiContext: readableAbiFunction,
    });

    if (!answer?.results || !answer?.results?.length) {
      return [];
    }

    const filteredAbi = answer.results.reduce(
      (accu, currentValue) => {
        const { address, functionSignatures } = currentValue;
        const abi = parseAbi(
          // append `function ` to the returned string so it can be parsed by parseAbi
          functionSignatures.map((func: string) => `function ${func}`),
        ) as AbiFunction[];
        accu.push({ address, abi });
        return accu;
      },
      [] as { address: string; abi: AbiFunction[] }[],
    );
    return filteredAbi;
  } catch (error) {
    console.error("Invalid JSON:", error);
    return [];
  }
}
