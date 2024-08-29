import { NETWORKS } from "./constants";

export type ChainIdEnum = keyof typeof NETWORKS;

export type IContract = {
  key: number;
  address: string;
  name: string;
  chainId: ChainIdEnum;
};
