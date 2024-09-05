import { CHAINS } from "./constants";

export type ChainIdEnum = keyof typeof CHAINS;

export type IContract = {
  key: number;
  address: string;
  name: string;
  description?: string;
  chainId: ChainIdEnum;
  abi?: AbiFunction[];
  functionDescriptions?: Record<string, IFunctionDescription>;
};

type IFunctionDescription = {
  description: string;
  inputs: { name: string; description: string }[];
};
