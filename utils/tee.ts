import axios from "axios";
import { KVCache } from "./kvCache";

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

interface wallet {
  wallet_id: string;
  access_key: string;
}

const TEE_URL = process.env.TEE_URL;
const axiosInstance = axios.create({
  baseURL: `${TEE_URL}/v1/api`,
  timeout: 10000,
  headers: {
    "x-magic-secret-key": process.env.MAGIC_SECRET_KEY,
  },
});

async function getWalletGroups() {
  try {
    const response = await axiosInstance.get("/wallet_groups");
    return response.data;
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error fetching Wallet Groups", e.message);
    } else {
      console.log(e);
    }
    throw e;
  }
}

async function createWallet(body: {
  wallet_group_id: string;
  network: "mainnet";
  encryption_context: string;
}) {
  try {
    const response = await axiosInstance.post("/wallet", body);
    return response.data;
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error fetching Wallet", e.message);
    } else {
      console.log(e);
    }
    throw e;
  }
}

async function getWalletUUIDandAccessKey(
  publicAddress: string,
): Promise<wallet> {
  try {
    // pa = public address
    const walletCache = new KVCache<string>("pa:");
    const rawWallet = await walletCache.get(publicAddress);

    if (rawWallet) {
      console.log(`pa:${publicAddress} in cache`);
      const existingWallet = JSON.parse(rawWallet);
      return {
        wallet_id: existingWallet.uuid,
        access_key: existingWallet.access_key,
      };
    }
    console.log(`pa:${publicAddress} NOT in cache`);
    const walletGroups = await getWalletGroups();

    // For now assume the first wallet group in case the magic tenant has more than one
    const [walletGroup] = walletGroups.data;

    const walletResponse = await createWallet({
      wallet_group_id: walletGroup.uuid,
      network: "mainnet",
      encryption_context: "0000",
    });
    const wallet = walletResponse.data;

    await walletCache.set(publicAddress, JSON.stringify(wallet));

    return { wallet_id: wallet.uuid, access_key: wallet.access_key };
  } catch (e) {
    // TODO handle error properly
    if (e instanceof Error) {
      console.error("Error fetching Wallet", e.message);
    } else {
      console.log(e);
    }
    throw e;
  }
}

export async function getTransactionReceipt({
  smartContractAddress,
  value,
  publicAddress,
}: {
  smartContractAddress: string;
  value: string;
  publicAddress: string;
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
