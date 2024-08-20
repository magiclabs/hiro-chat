import { AbiFunction } from "abitype";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";

export const generateToolFromABI =
  (contractAddress: string) =>
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
        console.log(func.name, args);
        // let value = args[tool.arguments[0].description]
        // const txReceipt = await getTransactionReceipt({
        //   smartContractAddress: contractAddress,
        //   value: args,
        //   // TODO:
        //   publicAddress: undefined,
        // });
        //     return `Called ${tool.methodName} with arguments ${value} at address ${config.smartContractAddress} on chain ${config.chain}. Transaction hash: ${txReceipt?.transactionHash ?? 'error'}`;
        return `Called ${func.name} with arguments ${JSON.stringify(
          args,
        )} at address ${contractAddress} on chain`;
      },
    });
  };
