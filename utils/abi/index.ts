import { KVCache } from "../kvCache";
import { ChainIdEnum } from "@/types";
import { AbiFunction } from "abitype";
import { polygonscanChains, getABIFromPolygonscan } from "./polygonscan";
import { etherscanChains, getABIFromEtherscan } from "./etherscan";

// ca = contract address
const cache = new KVCache<AbiFunction[]>("ca:");

export const getAbi = async function (
  contractAddress: string,
  chainId: ChainIdEnum,
): Promise<AbiFunction[]> {
  const key = `${contractAddress}-${chainId}`;
  const currentCache = await cache.get(key);

  // Check if ABI is already in cache
  if (currentCache) {
    return currentCache;
  }

  let abi: AbiFunction[] = [];
  if (etherscanChains[chainId]) {
    abi = await getABIFromEtherscan(contractAddress, chainId);
  }

  if (polygonscanChains[chainId]) {
    abi = await getABIFromPolygonscan(contractAddress, chainId);
  }

  if (abi.length > 0) {
    await cache.set(key, abi);
  }

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
    await cache.set(key, JSON.parse(abi));
    parsed = true;
  } catch (e) {
    console.error("Failed to parse ABI for contract", contractAddress);
  }
  return parsed;
};
