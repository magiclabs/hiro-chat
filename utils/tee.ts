import axios from "axios";
import * as ethers from "ethers";
import { TransactionError, NetworkError, SigningError } from "./errors";
import { KVCache } from "./kvCache";
import { getAbi } from "./etherscan";

type IWalletTxPayload = {
  type: number;
  chainId: number;
  nonce: number;
  data: string;
  value: string;
  gas: number;
  maxFeePerGas: number;
  maxPriorityFeePerGas: number;
  to: string;
};

type IWallet = {
  wallet_id: string;
  access_key: string;
  wallet_address: string;
};

type ITransactionReceipt = {
  transactionHash: string;
  message: string;
  status: string;
};

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

async function signTransaction({
  payload,
  access_key,
  wallet_id,
}: {
  payload: IWalletTxPayload;
  access_key: string;
  wallet_id: string;
}) {
  try {
    const response = await axiosInstance.post("/wallet/sign_transaction", {
      payload: payload,
      encryption_context: "0000",
      access_key: access_key,
      wallet_id: wallet_id,
    });
    return response.data.data.signed_transaction;
  } catch (error) {
    console.error("Error signing transaction", error);
    if (error instanceof Error) {
      throw new SigningError(`Signing error: ${error.message}`);
    }
    throw error;
  }
}

async function getWalletUUIDandAccessKey(
  publicAddress: string,
): Promise<IWallet> {
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

export async function getTransactionReceipt({
  contractAddress,
  functionName,
  chainId,
  args,
  publicAddress,
}: {
  contractAddress: string;
  chainId: number;
  functionName: string;
  args: any[];
  publicAddress: string;
}): Promise<ITransactionReceipt> {
  try {
    // TODO: wrap in Error class to denote ABI error
    const [abi, { wallet_id, wallet_address, access_key }] = await Promise.all([
      getAbi(contractAddress),
      getWalletUUIDandAccessKey(publicAddress),
    ]);

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(
      contractAddress,
      JSON.parse(abi),
      provider,
    );

    // TODO: wrap in Error class to denote gas errors
    const [nonce, feeData] = await Promise.all([
      provider.getTransactionCount(wallet_address),
      provider.getFeeData(),
    ]);
    const data = contract.interface.encodeFunctionData(functionName, args);
    const gasPrice = feeData.gasPrice;
    const maxFeePerGas = feeData.maxFeePerGas;
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;

    const payload: IWalletTxPayload = {
      type: 2,
      to: contractAddress,
      data,
      value: "0x" + BigInt(0).toString(16),
      gas: Number(gasPrice),
      maxFeePerGas: Number(maxFeePerGas),
      maxPriorityFeePerGas: Number(maxPriorityFeePerGas),
      // gas: 100000,
      // maxFeePerGas: 76000000000,
      // maxPriorityFeePerGas: 76000000000,
      nonce: nonce,
      chainId,
    };

    const signedTx = await signTransaction({
      payload,
      access_key: access_key,
      wallet_id: wallet_id,
    });

    console.log({ signedTx });

    try {
      const tx = await provider.broadcastTransaction(signedTx);
      const txReceipt = await tx.wait();
      const transactionHash = txReceipt?.hash ?? "";
      return {
        transactionHash,
        message: `Successfully added transaction ${transactionHash}`,
        status: "success",
      };
    } catch (error) {
      console.error("Error Broadcasting or waiting for transaction", error);
      if (error instanceof Error) {
        throw new TransactionError(error.message);
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
