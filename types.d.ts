import { CHAINS } from "./constants";

export type ChainIdEnum = keyof typeof CHAINS;

export type IContract = {
  key: number;
  address: string;
  name: string;
  description?: string;
  chainId: ChainIdEnum;
  abi?: AbiFunction[];
  abiDescriptions?: Record<string, IABIFunctionDescription>;
};

type IABIFunctionDescription = {
  description: string;
  inputs: { name: string; description: string }[];
};
