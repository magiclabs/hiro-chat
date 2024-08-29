import { IContract } from "@/types";
import { KVCollection } from "./kvCollection";

export const contractCollection = new KVCollection<Omit<IContract, "key">>(
  "contracts:",
);
