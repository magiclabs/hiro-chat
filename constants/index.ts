import { IContract } from "@/types";

export const CHAINS = {
  11155111: { name: "ETH Sepolia" },
  1: { name: "ETH Mainnet" },
  137: { name: "POLY Mainnet" },
  80001: { name: "POLY Mubai" },
};

export const FEATURED_CONTRACTS: IContract[] = [
  {
    key: -1,
    address: "0xb6A8F9612Db4BA200398122073F39E917e885232",
    chainId: 11155111,
    name: "Mo Test Token",
    description: "Contract Mo created for NFT public minting",
  },
  {
    key: -2,
    address: "0x9Db3197eec02B963151eEdf3C65Ac844197105C3",
    chainId: 11155111,
    name: "TestApe",
    description: "Publicly available NFT contract for minting. Happy Path",
  },
  {
    key: -3,
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    chainId: 1,
    name: "Uniswap",
    description: "Uniswap",
  },
  {
    key: -4,
    address: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E",
    chainId: 137,
    name: "Polymarket",
    description: "Polymarket",
  },
  // {
  //   address: "0xa807e2a221c6daafe1b4a3ed2da5e8a53fdaf6be",
  //   chainId: 11155111,
  //   name: "PudgyPenguins",
  //   description:
  //     "Publicly available NFT contract for minting. Throws TEE error",
  // },
  // {
  //   address: "0xbd3531da5cf5857e7cfaa92426877b022e612cf8",
  //   chainId: 1,
  //   name: "PudgyPenguins",
  //   description: "",
  // },
  // {
  //   address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  //   chainId: 1,
  //   name: "Tether USD",
  //   description: "",
  // },
  // {
  //   address: "0x40f48526fdca9bc212e8150cc44491b1acf018da",
  //   chainId: 1,
  //   name: "Saints and Sinners",
  //   description: "",
  // },
];
