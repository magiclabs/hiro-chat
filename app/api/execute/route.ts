import { NextRequest, NextResponse } from "next/server";
import { getAbi } from "@/utils/etherscan";
import { generateToolFromABI } from "@/utils/generateToolFromABI";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const toolCall = body.toolCall;
    const contractAddress = body.contractAddress;
    const network = body.network;
    const didToken = body.didToken;

    if (!toolCall || !contractAddress) {
      return new Response("error", { status: 400 });
    }

    try {
      const abi = await getAbi(contractAddress, network);
      const tools = JSON.parse(abi)
        .filter((f: any) => f.name && f.type === "function")
        .map(generateToolFromABI(contractAddress, didToken));

      const tool = tools.find((t: any) => t.name === toolCall.name);
      if (tool) {
        const reply = await tool.func(toolCall.args);
        return new Response(reply, { status: 200 });
      } else {
        return NextResponse.json(
          { error: "Function not found" },
          { status: 404 },
        );
      }
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
