import { IContract } from "@/types";

export const NETWORKS = {
  11155111: { name: "ETH Sepolia" },
  1: { name: "ETH Mainnet" },
};

export const FEATURED_CONTRACTS: IContract[] = [
  {
    address: "0xb6A8F9612Db4BA200398122073F39E917e885232",
    chainId: 11155111,
    name: "Mo Test Token",
    description: "Contract Mo created for NFT public minting",
  },
  {
    address: "0x9Db3197eec02B963151eEdf3C65Ac844197105C3",
    chainId: 11155111,
    name: "TestApe",
    description: "Publicly available NFT contract for minting. Happy Path",
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
