import { AbiFunction } from "abitype";
import { ZodArray, ZodBoolean, ZodNumber, ZodString, z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { Magic } from "@magic-sdk/admin";
import { getTransactionReceipt } from "./tee";
import { TransactionError, NetworkError, SigningError } from "./errors";
import { IContract } from "@/types";

const magic = await Magic.init(process.env.MAGIC_SECRET_KEY);
type IZodGeneric = ZodBoolean | ZodNumber | ZodString;

export const generateToolFromABI =
  (contract: IContract, didToken?: string) =>
  (func: AbiFunction, _: number, abiFunctions: AbiFunction[]): any => {
    let schema: any = {};
    func.inputs.forEach(({ name, type }) => {
      const isArray = type.includes("[]");
      const castType = type.includes("bool")
        ? "bool"
        : type.match(/int|fixed/)
        ? "numeric"
        : "string";

      let zodType: IZodGeneric | ZodArray<IZodGeneric> =
        castType === "bool"
          ? z.boolean()
          : castType === "numeric"
          ? z.number()
          : z.string();

      if (isArray) {
        zodType = z.array(zodType);
      }

      const descriptor = isArray ? "array" : "a";
      const description = `${descriptor} ${castType} input called ${name}`;
      zodType = zodType.describe(description);

      schema[name ?? ""] = zodType;
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
      name: `${contract.key}_${func.name}_${funcOverloadIndex}`,
      description: `This is a function called ${func.name}.  It belongs to the contract with the address ${contract.address} and the name ${contract.name}.  It takes ${inputLength} inputs as arguments consisting of ${inputString}`,
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
            chainId: contract.chainId,
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
