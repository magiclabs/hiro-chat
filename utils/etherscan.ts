// @ts-ignore
import Etherscan from "etherscan-api";
import { KVCache } from "./kvCache";

// ca = contract address
const cache = new KVCache<string>("ca:");

export const getAbi = async function (
  contractAddress: string,
): Promise<string> {
  const { ETHERSCAN_API_KEY } = process.env;

  if (!ETHERSCAN_API_KEY) {
    throw new Error("Missing ETHERSCAN_API_KEY");
  }

  const currentCache = await cache.getItem(contractAddress);

  // Check if ABI is already in cache
  if (currentCache) {
    console.log(`${contractAddress} in cache`);
    return currentCache;
  }

  console.log(`${contractAddress} NOT in cache`);
  const api = Etherscan.init(ETHERSCAN_API_KEY);

  // Fetch ABI from Etherscan
  const response = await api.contract.getabi(contractAddress);
  if (response.status !== "1") {
    throw new Error(`Failed to fetch ABI: ${response.result}`);
  }

  const abi = response.result;

  // Store the fetched ABI in cache
  await cache.setCache(contractAddress, abi);

  return abi;
};
