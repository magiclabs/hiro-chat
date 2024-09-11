import { IContract } from "@/types";

export const MODELS = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4o-2024-08-06", "gpt-4o-latest"],
  together: [
    "mistralai/Mistral-7B-Instruct-v0.3",
    "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
  ],
  ollama: ["mistral", "llama3.1"],
};

export const CHAINS = {
  11155111: {
    name: "ETH Sepolia",
    explorerURI: "https://sepolia.etherscan.io/tx/",
    rpcURI: "https://eth-sepolia.g.alchemy.com/v2/",
  },
  1: {
    name: "ETH Mainnet",
    explorerURI: "https://etherscan.io/tx/",
    rpcURI: "https://eth-mainnet.g.alchemy.com/v2/",
  },
  137: {
    name: "POLY Mainnet",
    explorerURI: "https://polygonscan.com/tx/",
    rpcURI: "https://polygon-mainnet.g.alchemy.com/v2/",
  },
  80002: {
    name: "POLY Amoy",
    explorerURI: "https://amoy.polygonscan.com/tx/",
    rpcURI: "https://polygon-amoy.g.alchemy.com/v2/",
  },
};

export const FEATURED_CONTRACTS: IContract[] = [
  // {
  //   key: -1,
  //   address: "0xb6A8F9612Db4BA200398122073F39E917e885232",
  //   chainId: 11155111,
  //   name: "Mo Test Token",
  //   description: "Contract Mo created for NFT public minting",
  // },
  // {
  //   key: -2,
  //   address: "0x9Db3197eec02B963151eEdf3C65Ac844197105C3",
  //   chainId: 11155111,
  //   name: "TestApe",
  //   description: "Publicly available NFT contract for minting. Happy Path",
  // },
  // {
  //   key: -5,
  //   address: "0xbF047018b5bD4077Ee4d20755C55F793cB1cAA0d",
  //   chainId: 80002,
  //   name: "Dan Polygon Token",
  //   description: "Contract Dan created for NFT public minting on polygon",
  // },
  // {
  //   key: -3,
  //   address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
  //   chainId: 1,
  //   name: "Uniswap",
  //   description: "Uniswap",
  // },
  // {
  //   key: -3,
  //   address: "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008",
  //   chainId: 11155111,
  //   name: "Uniswap sepolia",
  //   description: "Uniswap",
  // },
  // {
  //   key: -4,
  //   address: "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E",
  //   chainId: 137,
  //   name: "Polymarket",
  //   description: "Polymarket",
  // },
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
