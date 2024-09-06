import { CHAINS } from "./constants";

export type ChainIdEnum = keyof typeof CHAINS;

export type IContract = {
  key: number;
  address: string;
  name: string;
  description?: string;
  chainId: ChainIdEnum;
  abi?: AbiFunction[];
  abiDescriptions?: IABIFunctionDescription[];
};

export type IABIFunctionDescription = {
  name: string;
  description: string;
  valueDescription: string;
  inputs: { name: string; description: string }[];
};
