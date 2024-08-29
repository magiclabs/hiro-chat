// @ts-ignore
import Etherscan from "etherscan-api";
import { KVCache } from "./kvCache";
import { NETWORKS } from "@/constants";
import { ChainIdEnum } from "@/types";

// ca = contract address
export const contractAbiCache = new KVCache<string>("ca:");

const etherscanChains: Record<number, string> = {
  11155111: "sepolia",
  1: "mainnet",
};

export const getAbi = async function (
  contractAddress: string,
  chainId: ChainIdEnum,
): Promise<string> {
  if (!etherscanChains[chainId]) {
    throw new Error("Contract network not found while fetching ABI");
  }
  const { ETHERSCAN_API_KEY } = process.env;

  if (!ETHERSCAN_API_KEY) {
    throw new Error("Missing ETHERSCAN_API_KEY");
  }

  const key = `${contractAddress}-${chainId}`;
  const currentCache = await contractAbiCache.get(key);

  // Check if ABI is already in cache
  if (currentCache) {
    return currentCache;
  }

  const api = Etherscan.init(ETHERSCAN_API_KEY, etherscanChains[chainId]);

  // Fetch ABI from Etherscan
  const response = await api.contract.getabi(contractAddress);
  if (response.status !== "1") {
    throw new Error(`Failed to fetch ABI: ${response.result}`);
  }

  const abi = response.result;

  // Store the fetched ABI in cache
  await contractAbiCache.set(key, abi);
  await cache.set(contractAddress, abi);

  return abi;
};
