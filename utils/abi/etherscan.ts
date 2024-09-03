// @ts-ignore
import Etherscan from "etherscan-api";
import { ChainIdEnum } from "@/types";
import { AbiFunction } from "abitype";

export const getABIFromEtherscan = async (
  contractAddress: string,
  chainId: ChainIdEnum,
) => {
  if (!etherscanChains[chainId]) {
    throw new Error("Contract network not supported");
  }

  if (!process.env.ETHERSCAN_API_KEY) {
    throw new Error("Missing ETHERSCAN_API_KEY");
  }

  const api = Etherscan.init(
    process.env.ETHERSCAN_API_KEY,
    etherscanChains[chainId],
  );

  const response = await api.contract.getabi(contractAddress);
  if (response.status !== "1") {
    throw new Error(`Failed to fetch ABI: ${response.result}`);
  }

  return JSON.parse(response.result) as AbiFunction[];
};

export const etherscanChains: Record<number, string> = {
  11155111: "sepolia",
  1: "mainnet",
};
