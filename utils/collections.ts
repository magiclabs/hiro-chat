import { IContract } from "@/types";
import { KVCollection } from "./kvCollection";

class ContractCollection extends KVCollection<Omit<IContract, "key">> {
  public async get(): Promise<IContract[]> {
    return (await super.get()) as IContract[];
  }
}

export const contractCollection = new ContractCollection("contracts:");
