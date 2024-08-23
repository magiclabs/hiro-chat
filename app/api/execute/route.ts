import { NextRequest, NextResponse } from "next/server";
import { getAbi } from "@/utils/etherscan";
import { generateToolFromABI } from "@/utils/generateToolFromABI";
import { z } from "zod";

export const runtime = "nodejs";

const toolCallSchema = z.object({
  name: z.string({
    required_error: "toolCall.name is required",
    invalid_type_error: "toolCall.name must be a string",
  }),
  args: z.record(z.unknown()).optional(),
});
// .strict({
//   message:
//     "toolCall should only contain 'name' and optional 'args' properties",
// });

const routeBodySchema = z.object({
  toolCall: toolCallSchema.refine((data) => data.name.trim().length > 0, {
    message: "toolCall.name cannot be an empty string",
  }),
  contractAddress: z
    .string({
      required_error: "contractAddress is required",
      invalid_type_error: "contractAddress must be a string",
    })
    .min(1, "contractAddress cannot be an empty string"),
  network: z
    .string({
      required_error: "network is required",
      invalid_type_error: "network must be a string",
    })
    .min(1, "network cannot be an empty string"),
  didToken: z
    .string({
      required_error: "didToken is required",
      invalid_type_error: "didToken must be a string",
    })
    .min(1, "didToken cannot be an empty string"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = routeBodySchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => issue.message);
      const message = errorMessages.join(" ");
      return NextResponse.json(
        { message, error: errorMessages },
        { status: 400 },
      );
    }

    const { toolCall, contractAddress, network, didToken } = result.data;

    try {
      let abi = "[]";
      try {
        abi = await getAbi(contractAddress, network);
      } catch (e) {
        return NextResponse.json(
          {
            message: `Could Not retreive ABI for contract ${contractAddress}`,
            error: ["Invalid ABI"],
          },
          { status: 400 },
        );
      }

      const tools = JSON.parse(abi)
        .filter((f: any) => f.name && f.type === "function")
        .map(generateToolFromABI(contractAddress, didToken));

      const tool = tools.find((t: any) => t.name === toolCall.name);
      if (tool) {
        try {
          const reply = await tool.func(toolCall.args);
          console.log(reply);
          return new Response(reply.message, { status: 200 });
        } catch (error) {
          // TODO send error
          return new NextResponse("uh oh error", { status: 500 });
        }
      } else {
        return NextResponse.json(
          {
            message: `Function ${toolCall.name} not found in ${contractAddress}`,
            error: ["Invalid ABI"],
          },
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
