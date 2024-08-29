import { IContract } from "@/types";
import { KVCollection } from "./kvCollection";
import { FEATURED_CONTRACTS } from "@/constants";

class ContractCollection extends KVCollection<Omit<IContract, "key">> {
  public async get(): Promise<IContract[]> {
    const contracts = (await super.get()) as IContract[];
    const result = [...(FEATURED_CONTRACTS as IContract[]), ...contracts];
    return result;
  }
}

export const contractCollection = new ContractCollection("contracts:");
