import { IContract } from "@/types";
import { SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AbiFunction, formatAbi, parseAbi } from "abitype";
import { z } from "zod";
import { RunnableSequence } from "@langchain/core/runnables";
import { Message as VercelChatMessage } from "ai";
import { mapToLcMessages } from "./mapToLcMessages";
import { applyStructuredOutput, getModel } from "./getModel";

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
  modelName,
  input,
  contracts,
  chatHistory,
}: {
  modelName: string;
  input: string;
  contracts: IContract[];
  chatHistory: VercelChatMessage[];
}): Promise<IReasoningPromptResponse> {
  if (!modelName) {
    return [];
  }

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

  const model = getModel(modelName, { streaming: false });
  // const modelWithOutput = applyStructuredOutput(
  //   model,
  //   // @ts-ignore
  //   z.object({
  //     results: structuredOutputSchema,
  //   }),
  // );
  const structuredOptions = {
    // strict only applies to OpenAI ATM
    // strict: true,
  };

  // @ts-ignore
  const modelWithOutput = model.withStructuredOutput(
    z.object({
      results: structuredOutputSchema,
    }),
    structuredOptions,
  );

  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      [
        "You're an assistant whose tasked with narrowing the list of smart contracts and their associated functions signatures that you think apply given the conversation provided.",
        "You will be provided with a list functions the user can call.",
        "Based on the user's prompt, determine what functions they are trying to call. It can be fuzzy match",
        "There can be multiple functions across multiple contracts that apply to the user's input.",
        "Do not try to parse, understand, confirm, or interpret function inputs from the user's query. A second assistant will determine that.",
        "The following is a list of abi's and their functions (in the format {contract name}:{address} followed by the list of function underneath it with their arguments):",
        "functionSignatures should be of the structure given to you namely functionName(list of arguments)",
        "If theyre no matches its fine to return nothing.",
        "Do not hallucinate. Do not make up function signatures.",
      ].join(" "),
    ),
    {
      type: "system",
      content:
        "\nStart of Available ABI Functions\n{abiContext}\n End of Available ABI functions\n",
    },
    ...mapToLcMessages(chatHistory),
    { type: "human", content: "{input}" },
  ]);
  const chain = RunnableSequence.from([prompt, modelWithOutput]);
  // console.log(
  //   await prompt.format({
  //     input,
  //     abiContext: readableAbiFunction,
  //   }),
  // );
  try {
    const answer = await chain.invoke({
      input,
      abiContext: readableAbiFunction,
    });
    console.log(
      "Raw Reasoning Prompt Response",
      JSON.stringify(answer, null, 2),
    );

    if (!answer?.results || !answer?.results?.length) {
      return [];
    }

    const parsedResult = structuredOutputSchema.parse(answer.results);

    const filteredAbi = parsedResult.reduce(
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
