import { IContract } from "@/types";
import { KVCollection } from "./kvCollection";
import { FEATURED_CONTRACTS } from "@/constants";
import { getAbi } from "./abi";
import { getContractFunctionDescriptions } from "./generateToolFromABI";

class ContractCollection extends KVCollection<Omit<IContract, "key">> {
  public async get(): Promise<IContract[]> {
    const contracts = (await super.get()) as IContract[];
    const result = [...(FEATURED_CONTRACTS as IContract[]), ...contracts];
    return Promise.all(
      result.map(async (contract) => {
        const abi = await getAbi(contract.address, contract.chainId);
        const functionDescriptions = getContractFunctionDescriptions(
          contract,
          abi,
        );
        return { ...contract, abi, functionDescriptions };
      }),
    );
  }
}

export const contractCollection = new ContractCollection("contracts:");
