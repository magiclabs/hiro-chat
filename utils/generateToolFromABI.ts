import { AbiFunction, AbiParameter } from "abitype";
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
  (func: AbiFunction, _: number, abiFunctions: AbiFunction[]): any =>
    new DynamicStructuredTool({
      name: getToolName(contract, func, abiFunctions),
      description: getToolDescription(contract, func),
      schema: getToolSchema(func),
      func: getToolFunction(didToken, contract, func),
    });

const getToolName = (
  contract: IContract,
  func: AbiFunction,
  abiFunctions: AbiFunction[],
) => {
  const funcOverloadIndex = abiFunctions
    .filter((_func) => _func.name === func.name)
    .findIndex(
      (_func) => JSON.stringify(_func.inputs) === JSON.stringify(func.inputs),
    );

  return `${contract.key}_${func.name}_${funcOverloadIndex}`;
};

const getToolDescription = (contract: IContract, func: AbiFunction) => {
  const inputLength = func.inputs.length;
  const inputString = func.inputs
    .map(({ name, type }) => `"${name}" of type ${type}`)
    .join(", ");

  return `This is a function called ${func.name}.  It belongs to the contract with the address ${contract.address} and the name ${contract.name}.  It takes ${inputLength} inputs as arguments consisting of ${inputString}`;
};

const getToolSchema = (func: AbiFunction) => {
  let schema: any = {};
  schema.value = z
    .number()
    .describe(
      "An integer describing the amount to be included directly in a blockchain transaction",
    );

  func.inputs.forEach((input) => {
    schema[input.name ?? ""] = getInputSchema(input);
  });

  return z.object(schema);
};

const getInputSchema = (input: AbiParameter) => {
  const isArray = input.type.includes("[]");
  const castType = getInputCastType(input);

  let zodType: IZodGeneric | ZodArray<IZodGeneric> =
    castType === "bool"
      ? z.boolean()
      : castType === "numeric"
      ? z.number()
      : z.string();

  if (isArray) {
    zodType = z.array(zodType);
  }
  return zodType.describe(getInputDescription(input));
};

const getInputCastType = (input: AbiParameter) =>
  input.type.match(/^bool/)
    ? "bool"
    : input.type.match(/^u?(int|fixed)\d+/)
    ? "numeric"
    : "string";

const getInputDescription = (input: AbiParameter) => {
  const isArray = input.type.includes("[]");
  const castType = getInputCastType(input);
  const descriptor = isArray ? "array" : "a";
  return `${descriptor} ${castType} input called ${input.name}`;
};

const getToolFunction = (
  didToken: string | undefined,
  contract: IContract,
  func: AbiFunction,
) => {
  return async (args: Record<string, any>): Promise<string> => {
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
        value: args.value ?? 0,
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
        if (error instanceof TransactionError) {
          console.error(`${error.constructor.name}:`, error.message);
          const transactionHash = error.context.hash;
          return JSON.stringify({
            message: error.message,
            status: "failure",
            payload: transactionHash ? { transactionHash } : {},
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
  };
};
