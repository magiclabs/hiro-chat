import { AbiFunction } from "abitype";
import { z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { Magic } from "@magic-sdk/admin";
import { getTransactionReceipt } from "./tee";
import { TransactionError, NetworkError, SigningError } from "./errors";

const magic = await Magic.init(process.env.MAGIC_SECRET_KEY);

export const generateToolFromABI =
  (
    contract: { key: number; address: string; name: string },
    didToken?: string,
  ) =>
  (func: AbiFunction, _: number, abiFunctions: AbiFunction[]): any => {
    let schema: any = {};
    func.inputs.forEach((input) => {
      if (input.type === "uint256[]") {
        schema[input.name ?? ""] = z.array(z.number()).describe("description");
      } else if (input.type === "bool") {
        schema[input.name ?? ""] = z.boolean().describe("description");
      } else if (input.type.match(/int|fixed/)) {
        schema[input.name ?? ""] = z.number().describe("description");
      } else {
        schema[input.name ?? ""] = z.string().describe("description");
      }
    });

    const inputLength = func.inputs.length;
    const funcOverloadIndex = abiFunctions
      .filter((_func) => _func.name === func.name)
      .findIndex(
        (_func) => JSON.stringify(_func.inputs) === JSON.stringify(func.inputs),
      );

    const inputString = func.inputs
      .map(({ name, type }) => `"${name}" of type ${type}`)
      .join(", ");

    return new DynamicStructuredTool({
      name: `${contract.key}-${func.name}-${funcOverloadIndex}`,
      description: `Description for ${contract.address} ${func.name} with ${inputLength} inputs consisting of ${inputString}`,
      schema: z.object(schema),
      func: async (args): Promise<string> => {
        // This function should return a string according to the link hence the stringifed JSON
        // https://js.langchain.com/v0.2/docs/how_to/custom_tools/#dynamicstructuredtool
        if (!didToken) {
          return JSON.stringify({
            message: "No didToken",
            status: "failure",
            payload: {},
          });
        }
        const ensuredArgOrder = func.inputs.map((input) => {
          return args[input.name ?? ""];
        });

        const userMetadata = await magic.users.getMetadataByToken(didToken);
        const publicAddress = userMetadata.publicAddress ?? "";

        try {
          const txReceipt = await getTransactionReceipt({
            contractAddress: contract.address,
            functionName: func.name,
            args: ensuredArgOrder,
            publicAddress,
          });
          const { transactionHash, message, status } = txReceipt;

          return JSON.stringify({
            message: message,
            status,
            payload: {
              transactionHash,
            },
          });
        } catch (error) {
          // Not Rethrowing known errors here so that they can be shown inline in the UI
          if (
            [NetworkError, SigningError, TransactionError].some(
              (errType) => error instanceof errType,
            )
          ) {
            // Just to get around TS
            if (error instanceof Error) {
              console.error(`${error.constructor.name}:`, error.message);
              return JSON.stringify({
                message: error.message,
                status: "failure",
                payload: {},
              });
            }
          }

          console.error("Unexpected Error:", error);
          return JSON.stringify({
            message: "Unexpected Error",
            status: "failure",
            payload: {},
          });
        }
      },
    });
  };
