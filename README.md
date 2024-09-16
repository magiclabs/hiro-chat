# Magic Chat Prototype

## Quick start

- Clone the repo
- npm install

<!-- ENV -->

- Sign up for magic
- Create a magic app and get public key (NEXT_PUBLIC_MAGIC_API_KEY) and secret key (MAGIC_SECRET_KEY)
- Have your magic app enabled for TEE
- Get an Open AI API key (OPENAI_API_KEY)
- For RPC, you'll need an alchemy app. Set one up and add your api key (ALCHEMY_API_KEY)
- Set up a vercel KV store and copy the environment variables into the project (potentially show how to connect repo to KV)
- Set up etherscan/polygon scan accounts as desired and add api keys (ETHERSCAN_API_KEY, POLYGONSCAN_API_KEY)

- npm run dev

- Login to your magic account
- Set up a PIN for your TEE wallet
- Upload a contract (include sepolia uniswap contract address)
- Your TEE wallet address will appear in the bottom left, you can click to copy it
- Try asking it "Can you swap eth for USDC?"
- Refine your query to a function execution, click execute and enter your PIN
- If your execution was successful, your should have a link to the transaction
- If not, here are some notes to help troubleshoot (TBD)

## TODO

- Link to various external providers
- Magic
- Open AI
- Alchemy
- Vercel KV
- Etherscan
- Polygonscan

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
