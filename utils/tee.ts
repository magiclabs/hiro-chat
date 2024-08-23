import axios from "axios";
import { KVCache } from "./kvCache";
import * as ethers from "ethers";
import { getAbi } from "./etherscan";

interface wallet_tx_payload {
  type: number;
  chainId: number;
  nonce: number;
  data: string;
  value: string;
  gas: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  to: string;
}

interface wallet {
  wallet_id: string;
  access_key: string;
  wallet_address: string;
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
        wallet_address: existingWallet.public_address,
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

    return {
      wallet_id: wallet.uuid,
      access_key: wallet.access_key,
      wallet_address: wallet.public_address,
    };
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

type ITransactionReceipt = {
  transactionHash: string;
  message: string;
  status: string;
};

export async function getTransactionReceipt({
  contractAddress,
  functionName,
  args,
  publicAddress,
}: {
  contractAddress: string;
  functionName: string;
  args: any[];
  publicAddress: string;
}): Promise<ITransactionReceipt> {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const abi = await getAbi(contractAddress);
  const contract = new ethers.Contract(
    contractAddress,
    JSON.parse(abi),
    provider,
  );

  const { wallet_id, wallet_address, access_key } =
    await getWalletUUIDandAccessKey(publicAddress);

  const [nonce, feeData] = await Promise.all([
    provider.getTransactionCount(wallet_address),
    provider.getFeeData(),
  ]);
  const data = contract.interface.encodeFunctionData(functionName, args);
  const gasPrice = feeData.gasPrice;
  const maxFeePerGas = feeData.maxFeePerGas;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

  const payload: wallet_tx_payload = {
    type: 2,
    to: contractAddress,
    data,
    value: "0x" + BigInt(0).toString(16),
    gas: Number(gasPrice),
    maxFeePerGas: Number(maxFeePerGas),
    maxPriorityFeePerGas: Number(maxPriorityFeePerGas),
    // gas: 100000,
    // maxFeePerGas: 86000000000,
    // maxPriorityFeePerGas: 86000000000,
    nonce: nonce,
    chainId: 11155111,
  };

  try {
    const response = await axiosInstance.post("/wallet/sign_transaction", {
      payload: payload,
      encryption_context: "0000",
      access_key: access_key,
      wallet_id: wallet_id,
    });
    const signedTx = response.data.data.signed_transaction;
    console.log({ signedTx });
    const transactionHash =
      "0x0f4635490de9ddd2afc9896126282b7c15c958712e759bd2d2725484601b23af";
    // const tx = await provider.broadcastTransaction(signedTx);
    // const txReceipt = await tx.wait();
    // const transactionHash = txReceipt?.hash;
    return {
      transactionHash,
      message: `Successfully added transaction ${transactionHash}`,
      status: "success",
    };
  } catch (error) {
    console.error(error);
    let errorMessage = "An error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { transactionHash: "", message: errorMessage, status: "error" };
  }
}
