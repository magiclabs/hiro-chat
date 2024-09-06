// @ts-ignore
import Polygonscan from "polygonscan-api";
import { ChainIdEnum } from "@/types";
import { AbiFunction } from "abitype";

export const getABIFromPolygonscan = async (
  contractAddress: string,
  chainId: ChainIdEnum,
) => {
  if (!polygonscanChains[chainId]) {
    throw new Error("Contract network not supported");
  }

  if (!process.env.POLYGONSCAN_API_KEY) {
    throw new Error("Missing POLYGONSCAN_API_KEY");
  }

  const api = Polygonscan.init(
    process.env.POLYGONSCAN_API_KEY,
    polygonscanChains[chainId],
  );

  const response = await api.contract.getabi(contractAddress);
  if (response.status !== "1") {
    throw new Error(`Failed to fetch ABI: ${response.result}`);
  }

  try {
    return JSON.parse(response.result[0].ABI) as AbiFunction[];
  } catch (e) {}
  return [];
};

export const polygonscanChains: Record<number, string> = {
  137: "mainnet",
  80002: "amoy",
};
