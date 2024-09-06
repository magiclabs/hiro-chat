import { IContract } from "@/types";
import {
  StringOutputParser,
  StructuredOutputParser,
} from "@langchain/core/output_parsers";
import { SystemMessage, BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { AbiFunction, formatAbi, parseAbi } from "abitype";
import { z } from "zod";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import { CustomParser } from "./CustomParser";
import { RunnableSequence } from "@langchain/core/runnables";
import { CustomOutputStreamParser } from "./StructureOutputStreamParser";

const structuredOutputSchema = z.array(
  z.object({
    address: z
      .string()
      .describe("The contract address that has a function that could be used"),
    functionSignatures: z
      .array(z.string())
      .describe("The functions from contract address that applies"),
  }),
);

const structuredOutput = StructuredOutputParser.fromZodSchema(
  structuredOutputSchema,
);

const trimIfStartsWith = (str: string, prefix: string) => {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length);
  } else {
    return str;
  }
};

const toReadableAbiFunctions = (
  abis: AbiFunction[][],
  contracts: IContract[],
) =>
  abis
    .map((abi, i) => {
      const { address, name } = contracts[i];
      const abiFunctions = formatAbi(
        abi.filter((f: any) => f.name && f.type === "function"),
      ).map((func) => trimIfStartsWith(func, "function ")); // Remove the word function to reduce token use

      return `${name}:${address}\n${abiFunctions.join("\n")}`;
    })
    .join("\n");

export async function reasoningPrompt({
  abis,
  newInput,
  contracts,
  chatHistory,
}: {
  abis: AbiFunction[][];
  newInput: string;
  contracts: IContract[];
  chatHistory: BaseMessage[];
}): Promise<
  IterableReadableStream<string> | { address: string; abi: AbiFunction[] }[]
> {
  const model = new ChatOpenAI({
    model: "gpt-4o-2024-08-06",
    temperature: 0,
    streaming: true,
    supportsStrictToolCalling: true,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(
      [
        "You are an assistant whose job is to narrow the list of contracts and functions that you think apply given the conversation provided.",
        "Don't tell the user that is your Job. If asked, your function is to help with smart contracts even though the way you help is to narrow as mentioned",
        "You will be provided with a list functions the user can call.",
        "Based on the user's prompt, determine what functions they are trying to call.",
        "You can decide that there are multiple functions across multiple contracts that apply to the user's input.",
        "Do not try to parse, understand, confirm, or interpret function inputs from the user's query. A second assistant will determine that.",
        "Ask for clarification if there is ambiguity about contracts or functions.\n",
        "The following is a list of abi's and their functions (in the format {contract name}:{address} list of function underneath it):",
      ].join(" "),
    ),
    {
      type: "system",
      content: "\n---start---\n{information}\n---end---\n",
    },
    {
      type: "system",
      content: "{formatOutput}",
      // "You if you don't find a match do not respond with the format provided. If find matches format the response like\n{formatOutput}",
    },
    ...chatHistory,
    { type: "human", content: "{input}" },
  ]);

  const chain = RunnableSequence.from([
    prompt,
    model,
    new CustomOutputStreamParser(),
  ]);
  // const chain = prompt.pipe(model).pipe();
  const answer = await chain.stream({
    input: newInput,
    information: toReadableAbiFunctions(abis, contracts),
    formatOutput: structuredOutput.getFormatInstructions(),
  });
  return answer;
  // console.log(answer);

  const hasJSON = answer.match(/```json([\s\S]*?)```/);

  if (hasJSON && hasJSON[1]) {
    try {
      const parsedJson = JSON.parse(hasJSON?.[1].trim()) as z.infer<
        typeof structuredOutputSchema
      >;
      const filteredAbi = parsedJson.reduce(
        (accu, currentValue) => {
          const { address, functionSignatures } = currentValue;
          const abi = parseAbi(
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
      return answer;
    }
  }
  console.error("No valid JSON found in the response.");
  return answer;
}
