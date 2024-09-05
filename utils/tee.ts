import axios from "axios";
import * as ethers from "ethers";
import { TransactionError, SigningError } from "./errors";
import { KVCache } from "./kvCache";
import { IContract } from "@/types";
import { CHAINS } from "@/constants";

type IWalletTxPayload = {
  type: number;
  to: string;
  chainId: number;
  data: string;
  value: string;
  nonce?: number;
  gas?: number;
  maxFeePerGas?: number;
  maxPriorityFeePerGas?: number;
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

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
export async function getTransactionReceipt({
  contract,
  functionName,
  value: rawValue,
  args,
  publicAddress,
}: {
  contract: IContract;
  functionName: string;
  value: number;
  args: any[];
  publicAddress: string;
}): Promise<ITransactionReceipt> {
  try {
    // TODO: wrap in Error class to denote ABI error
    const { wallet_id, wallet_address, access_key } =
      await getWalletUUIDandAccessKey(publicAddress);

    const RPC_URL = `${CHAINS[contract.chainId].rpcURI}${ALCHEMY_KEY}`;
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wrappedContract = new ethers.Contract(
      contract.address,
      contract.abi as ethers.InterfaceAbi,
      provider,
    );

    const data = wrappedContract.interface.encodeFunctionData(
      functionName,
      args,
    );
    const value = "0x" + BigInt(rawValue).toString(16);

    let payload: IWalletTxPayload = {
      type: 2,
      to: contract.address,
      chainId: contract.chainId,
      data,
      value,
    };
    // TODO: wrap in Error class to denote gas errors
    const [nonce, feeData, gasEstimate] = await Promise.all([
      provider.getTransactionCount(wallet_address),
      provider.getFeeData(),
      getGasEstimate(provider, payload),
    ]);

    payload = {
      ...payload,
      nonce,
      gas: Number(gasEstimate),
      maxFeePerGas: Number(feeData.maxFeePerGas),
      maxPriorityFeePerGas: Number(feeData.maxPriorityFeePerGas),
    };

    const signedTx = await signTransaction({
      payload,
      access_key: access_key,
      wallet_id: wallet_id,
    });

    console.log({ signedTx });

    let tx: ethers.ethers.TransactionResponse | null = null;
    try {
      tx = await provider.broadcastTransaction(signedTx);
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
        throw new TransactionError(error.message, tx);
      }
      throw error;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

const getGasEstimate = async (
  provider: ethers.ethers.JsonRpcProvider,
  payload: ethers.ethers.TransactionRequest,
) => {
  try {
    return await provider.estimateGas(payload);
  } catch (e) {
    // Default gas
    return BigInt(100_000);
  }
};
