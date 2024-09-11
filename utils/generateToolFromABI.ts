import { AbiFunction, AbiParameter } from "abitype";
import { ZodArray, ZodBoolean, ZodNumber, ZodString, z } from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { Magic } from "@magic-sdk/admin";
import { TransactionError, NetworkError, SigningError } from "./errors";
import { IContract } from "@/types";
import { getTransactionReceiptWithPaymaster } from "./getTransactionReceiptWithPaymaster";

const magic = await Magic.init(process.env.MAGIC_SECRET_KEY);
type IZodGeneric = ZodBoolean | ZodNumber | ZodString;

export const getToolsFromContracts = (
  contracts: IContract[],
  didToken?: string,
) =>
  contracts.flatMap((contract) =>
    (contract.abi ?? [])
      .filter((f: any) => f.name && f.type === "function")
      .map(generateToolFromABI(contract, didToken)),
  );

export const getContractABIDescriptions = (
  contract: IContract,
  abi: AbiFunction[],
) =>
  abi
    .filter((f: any) => f.name && f.type === "function")
    .flatMap((func) => [
      {
        name: func.name,
        description: getToolDescription(contract, func),
        valueDescription:
          "An integer describing the amount to be included directly in a blockchain transaction. This should be represented as wei for ethereum based contracts, so if the user passes eth or gwei.etc, do the necessary conversion.",
        inputs: func.inputs.map((input) => ({
          name: input.name ?? "",
          description: getInputDescription(input),
        })),
      },
    ]);

const generateToolFromABI =
  (contract: IContract, didToken?: string) =>
  (func: AbiFunction, _: number, abi: AbiFunction[]): any => {
    const name = getToolName(contract, func, abi);
    const abiDescription = contract.abiDescriptions?.find((d) =>
      abi.find((f) => d.name === f.name && d.inputs.length === f.inputs.length),
    );

    let schema: any = {};
    schema.value = z.number().describe(abiDescription?.valueDescription ?? "");

    func.inputs.forEach((input) => {
      const inputDescription =
        abiDescription?.inputs.find((i) => i.name === input.name)
          ?.description ?? getInputDescription(input);

      schema[input.name ?? ""] =
        getInputSchema(input).describe(inputDescription);
    });

    return new DynamicStructuredTool({
      name,
      description: `${abiDescription?.description ?? ""}. Extra context: ${
        contract.context ?? ""
      }`,
      schema: z.object(schema),
      func: getToolFunction(didToken, contract, func),
    });
  };

const getToolName = (
  contract: IContract,
  func: AbiFunction,
  abi: AbiFunction[],
) => {
  const funcOverloadIndex = abi
    .filter((_func) => _func.name === func.name)
    .findIndex(
      (_func) => JSON.stringify(_func.inputs) === JSON.stringify(func.inputs),
    );

  return `${contract.key}_${func.name}_${funcOverloadIndex}`;
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
  return zodType;
};

const getInputDescription = (input: AbiParameter) => {
  const isArray = input.type.includes("[]");
  const castType = getInputCastType(input);
  const descriptor = isArray ? "array" : "a";
  return `${descriptor} ${castType} input called ${input.name}`;
};

const getInputCastType = (input: AbiParameter) =>
  input.type.match(/^bool/)
    ? "bool"
    : input.type.match(/^u?(int|fixed)\d+/)
    ? "numeric"
    : "string";

const getToolDescription = (contract: IContract, func: AbiFunction) => {
  const inputLength = func.inputs.length;
  const inputString = func.inputs
    .map(({ name, type }) => `"${name}" of type ${type}`)
    .join(", ");

  return `This is a function called ${func.name}.  It belongs to the contract with the address ${contract.address} and the name ${contract.name}.  It takes ${inputLength} inputs as arguments consisting of ${inputString}`;
};

const getToolFunction =
  (didToken: string | undefined, contract: IContract, func: AbiFunction) =>
  async (args: Record<string, any>): Promise<string> => {
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
      const txReceipt = await getTransactionReceiptWithPaymaster({
        contract: contract,
        functionName: func.name,
        value: args.value ?? 0,
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
        if (error instanceof TransactionError) {
          console.error(`${error.constructor.name}:`, error.message);
          const transactionHash = error.context?.hash;
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
