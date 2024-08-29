// @ts-ignore
import Etherscan from "etherscan-api";
import { KVCache } from "./kvCache";
import { ChainIdEnum } from "@/types";

// ca = contract address
const cache = new KVCache<string>("ca:");

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
  const currentCache = await cache.get(key);

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
  await cache.set(key, abi);

  return abi;
};

export const setAbi = async function (
  contractAddress: string,
  chainId: ChainIdEnum,
  abi: string,
): Promise<boolean> {
  const key = `${contractAddress}-${chainId}`;
  let parsed = false;
  try {
    JSON.parse(abi);
    parsed = true;
    await cache.set(key, abi);
  } catch (e) {
    console.error("Failed to parse ABI for contract", contractAddress);
  }
  return parsed;
};
