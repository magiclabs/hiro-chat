import { IContract } from "@/types";
import { KVCollection } from "./kvCollection";
import { FEATURED_CONTRACTS } from "@/constants";

type IContractWithKeyRequired = IContract & { key: number };
class ContractCollection extends KVCollection<Omit<IContract, "key">> {
  public async get(): Promise<IContractWithKeyRequired[]> {
    const contracts = (await super.get()) as IContractWithKeyRequired[];
    const result = [
      ...(FEATURED_CONTRACTS as IContractWithKeyRequired[]),
      ...contracts,
    ];
    return result;
  }
}

export const contractCollection = new ContractCollection("contracts:");
