# Magic Chat Prototype

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js**: Install the latest stable version of Node.js from [nodejs.org](https://nodejs.org/).
- **Magic Account**: Sign up at [Magic](https://magic.link/) for authentication and wallet services. You'll need access to their TEE service enabled for your Magic app.
- **OpenAI API Key**: Get an API key from [OpenAI](https://platform.openai.com/signup/).
- **Alchemy Account**: Sign up for [Alchemy](https://www.alchemy.com/). It is used as an RPC service.
- **Vercel Account**: Set up KV Storage on Vercel [Vercel](https://vercel.com/docs/storage/vercel-kv). You can also use it for deploying your project.
- **Etherscan/PolygonScan Accounts**: Sign up on [Etherscan](https://etherscan.io/) and [PolygonScan](https://polygonscan.com/) if you want to use their APIs for contract verification.

## Quickstart

### 1. Clone the Repository

```bash
git clone <repo-url>
cd <repo-folder>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

You'll need to set up various API keys and configuration settings. Copy the `.env.example` file as `.env` and update it as necessary with the values from your various accounts.

- **Magic API**: Create an app on [Magic](https://magic.link/) and copy your **public** and **secret** API keys. Make sure your Magic app has TEE (Trusted Execution Environment) enabled.
- **OpenAI API**: Get your API key for [OpenAI](https://platform.openai.com/).
- **Alchemy API**: Create an app on Alchemy and obtain your API key. Follow the [Alchemy documentation](https://docs.alchemy.com/alchemy/) for more details.
- **Vercel KV Store**: Copy your [Vercel KV](https://vercel.com/docs/storage/vercel-kv) environment variables into your `.env`
- **Etherscan/PolygonScan API**: Optionally, create accounts on [Etherscan](https://etherscan.io/register) or [PolygonScan](https://polygonscan.com/register) and add their respective API keys.

### 4. Run the Project

To start the development server:

```bash
npm run dev
```

The app should now be running on `http://localhost:3000`.

### 5. Set Up Your Magic TEE Wallet

1. **Login to your Magic account** via the UI.
2. **Set up a PIN** for your TEE wallet. This will be used for signing transactions securely.
3. **Transfer funds** You'll need some tokens in your wallet to pay for gas fees. You can use a faucet like [Chainlink](https://faucets.chain.link/sepolia) if you need some testnet tokens.

### 6. Upload a Contract

- You can upload contracts using your Magic TEE wallet. For example, you can start by uploading a **Uniswap contract** on the Sepolia testnet.

  Example Uniswap contract address on Sepolia:

  ```
  0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008
  ```

### 7. Execute Queries

- **Wallet Address**: Your TEE wallet address will be visible in the bottom-left corner of the interface. Click the address to copy it.
- **Ask Queries**: Try asking questions like "Can you swap ETH for USDC?" in the app's interface.
- **Execute Functions**: Refine your query to a specific function execution. Click "Execute" and enter your PIN to proceed.

### 8. Check Transaction Status

If the execution is successful, you will receive a link to the transaction on the blockchain (e.g., Etherscan). If not, check the following:

- Ensure you have a valid wallet PIN.
- Verify that you have sufficient funds for gas fees.
- Check if the contract is correctly uploaded and the address is valid.

## Known issues

- Inline toolcalls
- llama 3.1 is more likely to do tool calls earlier than open ai, can hallucinate values often
- Even with multi agent filtering, it's possible to have too many/ambiguous tool calls based on the number of uploaded and enabled contracts
- if you upload a contract that has functions that need a non-zero amount of eth included in the transaction, you'll need to add those function descriptions manually after upload

## Repo structure

- TODO

## Customization

- Describe how to opt-in to together, fireworks and ollama (walk through settings modal)
- Walk through how to edit contracts, how context works, how modifying function/ function input descriptions works
- Walk through how to disable/enable contracts locally

## Prompt Control Flow

- Explain multi agent functionality and how it tries to filter down number of tool calls
- Explain lambda timestamp functionality

## Deployment

- Is built to be deployable on vercel, but should be able to deploy elsewhere (link to next documentation)

## Dependencies

- vercel/ai
- langchain
- shadcn
- magic sdk
- ethers/web3/viem
