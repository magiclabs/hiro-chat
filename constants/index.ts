export const MODELS = {
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4o-2024-08-06", "gpt-4o-latest"],
  together: [
    "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
    "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
  ],
  ollama: ["mistral", "llama3.1"],
  fireworks: [
    "accounts/fireworks/models/llama-v3p1-8b-instruct",
    "accounts/fireworks/models/llama-v3p1-70b-instruct",
    "accounts/fireworks/models/llama-v3p1-405b-instruct",
    "accounts/fireworks/models/mixtral-8x22b-instruct",
    "accounts/fireworks/models/firefunction-v1",
  ],
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
