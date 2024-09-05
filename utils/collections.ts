import { IContract } from "@/types";
import { KVCollection } from "./kvCollection";
import { FEATURED_CONTRACTS } from "@/constants";
import { getAbi } from "./abi";

class ContractCollection extends KVCollection<Omit<IContract, "key">> {
  public async get(): Promise<IContract[]> {
    const contracts = (await super.get()) as IContract[];
    const result = [...(FEATURED_CONTRACTS as IContract[]), ...contracts];
    return Promise.all(
      result.map(async (contract) => {
        const abi = await getAbi(contract.address, contract.chainId);
        return { ...contract, abi };
      }),
    );
  }
}

export const contractCollection = new ContractCollection("contracts:");
