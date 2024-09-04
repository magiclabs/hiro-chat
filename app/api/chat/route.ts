import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { getAbi } from "@/utils/abi";
import { generateToolFromABI } from "@/utils/generateToolFromABI";
import { CustomParser } from "@/utils/CustomParser";
import { contractCollection } from "@/utils/collections";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const contracts = await contractCollection.get();
    const formattedPreviousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;
    const contractAddresses = contracts.map(({ address }) => address);

    const prompt = ChatPromptTemplate.fromMessages([
      {
        type: "system",
        content:
          "You are to interact with smart contracts on behalf of the user. The smart contract addresses are {contractAddresses}. You will be provided with functions that represent the functions in the ABI the user can call. Based on the user's prompt, determine what function they are trying to call, and extract the appropriate inputs. If there is ambiguity about which contract they want to call the function on, ask for clarification.",
      },
      ...formattedPreviousMessages.map(
        ({ role, content }: { role: string; content: string }) => ({
          type: role as "system" | "user" | "assistant",
          content,
        }),
      ),
      {
        type: "user",
        content: "{input}",
      },
    ]);

    try {
      const abis = await Promise.all(
        contracts.map((contract) => getAbi(contract.address, contract.chainId)),
      );
      const tools = abis.flatMap((abi, i) => {
        const contract = contracts[i];
        return abi
          .filter((f: any) => f.name && f.type === "function")
          .map(generateToolFromABI(contract));
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
