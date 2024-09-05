import { IContract } from "@/types";
import { KVCollection } from "./kvCollection";
// import util from "util";
class ContractCollection extends KVCollection<Omit<IContract, "key">> {
  public async get(): Promise<IContract[]> {
    const contracts = (await super.get()) as IContract[];
    // console.log(util.inspect(contracts, false, 5, true));
    return contracts;
  }
}

export const contractCollection = new ContractCollection("contracts:");
