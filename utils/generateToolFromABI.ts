import { AbiFunction } from "abitype";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { Magic } from "@magic-sdk/admin";
import { getTransactionReceipt } from "./tee";

const magic = await Magic.init(process.env.MAGIC_SECRET_KEY);

export const generateToolFromABI =
  (contractAddress: string, didToken?: string) =>
  (func: AbiFunction): any => {
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
      func: async (args) => {
        if (didToken) {
          const userMetadata = await magic.users.getMetadataByToken(didToken);
          const publicAddress = userMetadata.publicAddress ?? "";
          const txReceipt = await getTransactionReceipt({
            contractAddress,
            functionName: func.name,
            // TODO: ensure args are always in correct order
            args: Object.values(args),
            publicAddress,
          });
          return `Called ${func.name} with arguments ${JSON.stringify(args)}.
txReceipt: ${txReceipt}`;
        }
      },
    });
  };
