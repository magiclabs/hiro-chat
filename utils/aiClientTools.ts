import { ChatOpenAI } from "@langchain/openai";
import { getAbi } from "./etherscan";
import { AbiFunction } from "abitype";
import { z } from "zod";
import { DynamicStructuredTool } from "langchain/tools";
import { Readable } from "stream";

export type IMessage = {
  type: "user" | "machine" | "system";
  content: string;
};

export const AiClientTools = async function ({
  contractAddress,
  messages = [],
}: {
  contractAddress: string;
  messages?: IMessage[];
}) {
  const { OPENAI_API_KEY } = process.env;

  if (!OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const abi = await getAbi(contractAddress);
  const tools = JSON.parse(abi)
    .filter((f: any) => f.name && f.type === "function")
    .map(generateToolFromABI);

  try {
    const model = new ChatOpenAI({
      model: "gpt-4o-mini",
      temperature: 0,
      apiKey: process.env.OPENAI_KEY,
    }).bindTools(tools);

    const SYSTEM_PROMPT = `You are to interact with a smart contract on behalf of the user. The smart contract address is ${contractAddress}. You will be provided with functions that represent the functions in the ABI the user can call. Based on the user's prompt, determine what function they are trying to call, and extract the appropriate inputs.`;
    const llmStream = await model.stream([
      ["system", SYSTEM_PROMPT],
      ...messages.flatMap((m) => [m.type.replace("machine", "ai"), m.content]),
    ]);

    const stream = new Readable({
      objectMode: true,
      async read() {
        for await (const chunk of llmStream) {
          if ((chunk.tool_call_chunks?.length ?? 0) > 0) {
            this.push(chunk.tool_call_chunks?.at(0)?.args ?? "");
          } else if (chunk.content) {
            this.push(chunk.content);
          }
        }
        this.push(null);
      },
    });

    return stream;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

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
