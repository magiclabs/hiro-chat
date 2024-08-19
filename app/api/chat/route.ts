import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { getAbi } from "@/utils/etherscan";
import { AbiFunction } from "abitype";
import { DynamicStructuredTool } from "langchain/tools";
import { z } from "zod";
import {
  HttpResponseOutputParser,
  JsonOutputFunctionsParser,
  JsonOutputKeyToolsParser,
  JsonOutputToolsParser,
  CombiningOutputParser,
} from "langchain/output_parsers";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Readable } from "stream";

export const runtime = "nodejs";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
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
      }).bindTools(tools);

      const chain = prompt
        .pipe(model)
        // .pipe(new StringOutputParser())
        .pipe(async function* (chunk) {
          if ((chunk.tool_call_chunks?.length ?? 0) > 0) {
            yield chunk.tool_call_chunks?.at(0)?.args ?? "";
          } else if (chunk.content) {
            yield chunk.content;
          }
        });

      // const outputParser = new JsonOutputToolsParser();

      // const chain = prompt
      //   .pipe(model)
      //   .pipe(
      //     new CombiningOutputParser(
      //       new StringOutputParser(),
      //       new JsonOutputFunctionsParser(),
      //     ),
      //   );

      const stream = await chain.stream({
        chat_history: formattedPreviousMessages.join("\n"),
        input: currentMessageContent,
      });

      return new StreamingTextResponse(stream);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }

    // const model = new ChatOpenAI({
    //   temperature: 0.8,
    //   model: "gpt-3.5-turbo-0125",
    // });

    // const outputParser = new HttpResponseOutputParser();

    // const chain = prompt.pipe(model).pipe(outputParser);

    // const stream = await chain.stream({
    //   chat_history: formattedPreviousMessages.join("\n"),
    //   input: currentMessageContent,
    // });

    // return new StreamingTextResponse(stream);
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
