import { NETWORKS } from "./constants";

export type NetworkEnum = keyof typeof NETWORKS;

export type IContract = {
  key: number;
  address: string;
  name: string;
  network: NetworkEnum;
};
