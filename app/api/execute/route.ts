import { NextRequest, NextResponse } from "next/server";
import { getAbi } from "@/utils/etherscan";
import { generateToolFromABI } from "@/utils/generateToolFromABI";
import { routeBodySchema } from "./schemas";
import { contractCollection } from "@/utils/collections";

export const runtime = "nodejs";

/**
 * Error responds with json: { error: "message of the error"}
 * Success responds with stringified json: { status: "string of the tx status", message: "String of what happened", payload: Object with metadata about the tx }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = routeBodySchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue) => issue.message)
        .join(" ");
      return NextResponse.json({ error: errorMessages }, { status: 400 });
    }

    const { toolCall, didToken } = result.data;

    // parse contractAddress from toolCall.name;  Should be in format `${contractKey}-${functionName}-${overload function index}``
    const contractKey = parseInt(toolCall.name.split("-").at(0) as string, 10);
    const contracts = await contractCollection.get();
    const contract = contracts.find(({ key }) => contractKey === key);

    if (!contract) {
      return NextResponse.json(
        {
          error: `Unable to find reference ${contractKey}`,
        },
        { status: 400 },
      );
    }

    try {
      let abi = "[]";
      try {
        abi = await getAbi(contract.address, contract.chainId);
      } catch (e) {
        return NextResponse.json(
          {
            error: `Could Not retreive ABI for contract ${contract.address}`,
          },
          { status: 400 },
        );
      }

      const tools = JSON.parse(abi)
        .filter((f: any) => f.name && f.type === "function")
        .map(generateToolFromABI(contract, didToken));

      const tool = tools.find((t: any) => t.name === toolCall.name);
      if (!tool) {
        return NextResponse.json(
          {
            error: `Function ${toolCall.name} not found in ${contract.address}`,
          },
          { status: 404 },
        );
      }

      try {
        // Reply should be stringified { message: string, status: string, payload: record<string, any>}
        const reply = await tool.func(toolCall.args);
        console.log(reply);
        // tool.func will not throw an error bc it should always return a string. Ergo this will always return 200
        return new Response(reply, { status: 200 });
      } catch (error) {
        console.error(error);
        return NextResponse.json(
          {
            error: "An unknown Error occured",
          },
          { status: 500 },
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
