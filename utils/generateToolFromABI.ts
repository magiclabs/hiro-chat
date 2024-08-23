import { AbiFunction } from "abitype";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { Magic } from "@magic-sdk/admin";
import { getTransactionReceipt } from "./tee";

const magic = await Magic.init(process.env.MAGIC_SECRET_KEY);

type IDynamicFunctionCallReturn = {
  message: string;
  payload: any;
  toString(): string;
};

function generateToolResponse({
  message,
  payload,
  status,
}: {
  message: string;
  payload: any;
  status: "failure" | "success" | string;
}) {
  return {
    message,
    payload,
    toString(): string {
      if (status === "failure") {
        if ("txReceipt" in payload) {
        }
      }
      return `${this.message}. txReceipt: Transaction Hash - ${this.payload.transactionHash}, Error - ${this.txReceipt.error}`;
    },
  };
}

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
      func: async (args): Promise<IDynamicFunctionCallReturn> => {
        // This function should return a string according to the link below but we need more structured response
        // https://js.langchain.com/v0.2/docs/how_to/custom_tools/#dynamicstructuredtool
        if (!didToken) {
          return generateToolResponse({
            message: "No didToken",
            payload: {},
            status: "failure",
          });
        }
        const ensuredArgOrder = func.inputs.map((input) => {
          return args[input.name ?? ""];
        });

        const userMetadata = await magic.users.getMetadataByToken(didToken);
        const publicAddress = userMetadata.publicAddress ?? "";

        try {
          const txReceipt = await getTransactionReceipt({
            contractAddress,
            functionName: func.name,
            args: ensuredArgOrder,
            publicAddress,
          });
          const { transactionHash, message, status } = txReceipt;

          return generateToolResponse({
            message: message,
            status,
            payload: {
              transactionHash,
            },
          });
        } catch (e) {
          console.error("Error in  DynamicStructureTool Function call", e);
          return generateToolResponse({
            message: "there was an error Executing your request",
            status: "failure",
            payload: {},
          });
        }
      },
    });
  };
