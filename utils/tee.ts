import axios from "axios";

interface wallet_tx_payload {
  type: number;
  chainId: number;
  nonce: number;
  value: string;
  gas: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  to: string;
}

const TEE_URL = process.env.NEXT_PUBLIC_TEE_URL;
const axiosInstance = axios.create({
  baseURL: `${TEE_URL}/v1/api`,
  timeout: 10000,
  headers: {
    "x-magic-secret-key": process.env.MAGIC_SECRET_KEY,
  },
});

async function getWalletUUIDandAccessKey(publicAddress?: string) {
  //todo get/create wallet and access key
  //1. check if a wallet has been created for a given public address.
  //2. if not, create a new wallet and return the wallet_id and access_key. Store this mapping
  //3. if yes, return the wallet_id and access_key using the public address as the key
  return {
    wallet_id: process.env.USER_WALLET_UUID,
    access_key: process.env.USER_ACCESS_KEY,
  };
}

export async function getTransactionReceipt({
  smartContractAddress,
  value,
  publicAddress,
}: {
  smartContractAddress: string;
  value: string;
  publicAddress?: string;
}) {
  const hexValue = "0x" + BigInt(value).toString(16);

  const payload: wallet_tx_payload = {
    type: 2,
    chainId: 11155111,
    nonce: 1,
    value: hexValue,
    gas: 100000,
    maxFeePerGas: 2000000000,
    maxPriorityFeePerGas: 2000000000,
    // to: smartContractAddress,
    // TODO: this doesn't work with smart contract address?
    to: publicAddress ?? "",
  };

  const { wallet_id, access_key } = await getWalletUUIDandAccessKey(
    publicAddress,
  );

  try {
    const response = await axiosInstance.post("/wallet/sign_transaction", {
      payload: payload,
      encryption_context: "0000",
      access_key: access_key,
      wallet_id: wallet_id,
    });

    const signedTx = response.data.data.signed_transaction;

    return signedTx;
    /**
     * Uncomment this after RPC_URL Is created
     */
    // const provider = new ethers.JsonRpcProvider(RPC_URL);
    // const tx = await provider.broadcastTransaction(signedTx);
    // Create a provider using the RPC URL
    // console.log(tx);

    //todo make it properly send to the rpc url
    //make this gasless

    // Send the signed transaction
    // const tx = await provider.broadcastTransaction(signedTx);
    // console.log(tx)
    // Wait for the transaction to be mined
    // const txReceipt = await tx.wait();
    // console.log(txReceipt)
    // return {
    //   transactionHash: txReceipt.hash
    // };
    return {
      transactionHash: "0x123",
    };
  } catch (error) {
    console.log(error);
  }
}
