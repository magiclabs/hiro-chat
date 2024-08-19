// @ts-ignore
import Etherscan from "etherscan-api";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { FileCache } from "./fileCache";

const cacheFilePath = join(__dirname, "../data/abiCache.json");
// create cache if it doesn't exist
if (!existsSync(cacheFilePath)) {
  const dir = dirname(cacheFilePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(cacheFilePath, JSON.stringify({}), "utf8");
}
const cache = new FileCache<string>(cacheFilePath);

export const getAbi = async function (
  contractAddress: string,
): Promise<string> {
  const { ETHERSCAN_API_KEY } = process.env;

  if (!ETHERSCAN_API_KEY) {
    throw new Error("Missing ETHERSCAN_API_KEY");
  }

  const currentCache = await cache.getCache();

  // Check if ABI is already in cache
  if (currentCache[contractAddress]) {
    console.log(`${contractAddress} in cache`);
    return currentCache[contractAddress];
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
  await cache.addItem(contractAddress, abi);

  return abi;
};
