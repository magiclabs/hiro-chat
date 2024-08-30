import { IContract } from "@/types";
import {
  StringOutputParser,
  StructuredOutputParser,
} from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { AbiFunction, AbiType, formatAbi } from "abitype";
import { z } from "zod";

const structuredOutputSchema = z.array(
  z.object({
    address: z
      .string()
      .describe("The contract address that has a function that could be used"),
    functions: z
      .array(z.string())
      .describe("The functions from contract address that applies"),
  }),
);

const structuredOutput = StructuredOutputParser.fromZodSchema(
  structuredOutputSchema,
);

const toReadableAbiFunctions = (abis: AbiType[], contracts: IContract[]) =>
  abis
    .map((abi, i) => {
      const parsedAbiFunctions = JSON.parse(abi).filter(
        (f: any) => f.name && f.type === "function",
      );
      return {
        contractAddress: contracts[i].address,
        functions: formatAbi(parsedAbiFunctions),
      };
    })
    .map(({ contractAddress, functions }) => {
      return `${contractAddress}\n${functions.join("\n")}`;
    })
    .join("\n");

export async function prePromptPromt({
  abis,
  newInput,
  contracts,
  chatHistory,
}: {
  abis: AbiType[];
  newInput: string;
  contracts: IContract[];
  chatHistory: {
    role: string;
    content: string;
  }[];
}): Promise<z.infer<typeof structuredOutputSchema>> {
  const model = new ChatOpenAI({
    model: "gpt-4o-2024-08-06",
    temperature: 0,
    streaming: true,
    supportsStrictToolCalling: true,
  });

  // Transform chatHistory to the expected type
  const transformedHistory = chatHistory.map(({ role, content }) => ({
    type: role as "system" | "user" | "assistant",
    content,
  }));

  const prompt = ChatPromptTemplate.fromMessages([
    {
      type: "system",
      content:
        "You are to interact with smart contracts on behalf of the user.",
    },
    {
      type: "system",
      content:
        "You will be provided with functions that represent the functions in the ABI the user can call. Based on the user's prompt, determine what function they are trying to call, and extract the appropriate inputs",
    },
    {
      type: "system",
      content:
        "If there is ambiguity about which contract they want to call the function on, ask for clarification.",
    },
    {
      type: "system",
      content:
        "The following is a list of abi's and their functions (address followed by list of function)\n---start---\n{information}\n---end---",
    },
    {
      type: "system",
      content:
        "Just tell me the contracts and functions you think apply to my query. It can be more than one if you think so.\n{formatOutput}",
    },
    ...transformedHistory,
    { type: "user", content: "{input}" },
  ]);

  console.log(
    await prompt.format({
      input: newInput,
      information: toReadableAbiFunctions(abis, contracts),
      formatOutput: structuredOutput.getFormatInstructions(),
    }),
  );

  const chain = prompt.pipe(model).pipe(new StringOutputParser());
  const answer = await chain.invoke({
    input: newInput,
    information: toReadableAbiFunctions(abis, contracts),
    formatOutput: structuredOutput.getFormatInstructions(),
  });
  console.log(answer);
  if (answer.startsWith("```json") && answer.endsWith("```")) {
    const jsonContent = answer.slice(7, -3).trim();
    console.log(jsonContent);
    try {
      return JSON.parse(jsonContent);
    } catch (error) {
      console.error("Invalid JSON:", error);
      return [];
    }
  }

  console.log("String does not contain valid JSON.", answer);
  return [];
}
