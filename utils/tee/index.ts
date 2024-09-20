import axios from "axios";
import * as ethers from "ethers";
import crypto from "crypto";
import { TransactionError, SigningError } from "@/utils/errors";
import { KVCache } from "@/utils/kv/kvCache";
import { ChainIdEnum, IContract } from "@/types";
import { CHAINS } from "@/constants";
import { ERC20_ABI } from "./erc20";

const FUNDER_PUBLIC_ADDRESS = process.env.TEE_FUNDER_PUBLIC_ADDRESS ?? "";
const FUNDER_ENCRYPTION_CONTEXT =
  process.env.TEE_FUNDER_ENCRYPTION_CONTEXT ?? "";

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
  encryption_context,
}: {
  payload: IWalletTxPayload;
  access_key: string;
  wallet_id: string;
  encryption_context: string;
}) {
  try {
    const response = await axiosInstance.post("/wallet/sign_transaction", {
      payload: payload,
      encryption_context: encryption_context,
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

export async function getWalletUUIDandAccessKey(
  publicAddress: string,
  encryptionContext?: string,
): Promise<IWallet> {
  try {
    // pa = public address
    const walletCache = new KVCache<string>("pa:");
    const rawWallet = await walletCache.get(publicAddress);

    if (rawWallet) {
      const existingWallet = JSON.parse(rawWallet);
      return {
        wallet_id: existingWallet.uuid,
        access_key: existingWallet.access_key,
        wallet_address: existingWallet.public_address,
      };
    }

    if (!encryptionContext)
      throw new Error("Wallet not found and missing encryption context");

    const walletGroups = await getWalletGroups();

    // For now assume the first wallet group in case the magic tenant has more than one
    const [walletGroup] = walletGroups.data;

    const walletResponse = await createWallet({
      wallet_group_id: walletGroup.uuid,
      network: "mainnet",
      encryption_context: encryptionContext,
    });
    const wallet = walletResponse.data;

    await walletCache.set(publicAddress, JSON.stringify(wallet));

    try {
      await transfer({
        to: wallet.public_address,
        value: "0.00000001",
        chainId: 11155111, // sepolia
      });
      await transfer({
        to: wallet.public_address,
        value: "0.00000001",
        chainId: 80002, // amoy
      });
    } catch (e) {
      if (e instanceof Error) {
        console.error("Error funding Wallet", e.message);
      } else {
        console.log(e);
      }
    }

    return {
      wallet_id: wallet.uuid,
      access_key: wallet.access_key,
      wallet_address: wallet.public_address,
    };
  } catch (e) {
    if (e instanceof Error) {
      console.error("Error fetching Wallet", e.message);
    } else {
      console.log(e);
    }
    throw e;
  }
}

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY;
const getProvider = (chainId: ChainIdEnum) => {
  const RPC_URL = `${CHAINS[chainId].rpcURI}${ALCHEMY_KEY}`;
  return new ethers.JsonRpcProvider(RPC_URL);
};

async function signAndBroadcastPayload({
  chainId,
  value,
  data,
  to,
  publicAddress,
  encryptionContext,
}: {
  chainId: ChainIdEnum;
  value: string;
  data: string;
  to: string;
  publicAddress: string;
  encryptionContext: string;
}): Promise<ITransactionReceipt> {
  try {
    const { wallet_id, wallet_address, access_key } =
      await getWalletUUIDandAccessKey(publicAddress, encryptionContext);

    let payload: IWalletTxPayload = { type: 2, to, chainId, data, value };
    const provider = getProvider(chainId);
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
      access_key,
      wallet_id,
      encryption_context: encryptionContext,
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

async function transfer({
  to,
  value: rawValue,
  chainId,
}: {
  chainId: ChainIdEnum;
  to: string;
  value: string;
}): Promise<ITransactionReceipt> {
  const wrappedContract = new ethers.Contract(
    FUNDER_PUBLIC_ADDRESS,
    ERC20_ABI,
    getProvider(chainId),
  );

  const value = ethers.parseEther(rawValue);
  const data = wrappedContract.interface.encodeFunctionData("transfer", [
    to,
    value,
  ]);

  return signAndBroadcastPayload({
    chainId,
    to,
    value: "0x" + value.toString(16),
    data,
    publicAddress: FUNDER_PUBLIC_ADDRESS,
    encryptionContext: FUNDER_ENCRYPTION_CONTEXT,
  });
}

export async function getTransactionReceipt({
  contract,
  functionName,
  value: rawValue,
  args,
  publicAddress,
  encryptionContext,
}: {
  contract: IContract;
  functionName: string;
  value: number;
  args: any[];
  publicAddress: string;
  encryptionContext: string;
}): Promise<ITransactionReceipt> {
  const wrappedContract = new ethers.Contract(
    contract.address,
    contract.abi as ethers.InterfaceAbi,
    getProvider(contract.chainId),
  );

  const data = wrappedContract.interface.encodeFunctionData(functionName, args);
  const value = "0x" + BigInt(rawValue).toString(16);

  return signAndBroadcastPayload({
    chainId: contract.chainId,
    to: contract.address,
    value,
    data,
    publicAddress,
    encryptionContext,
  });
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

export async function hashPin(pin: string) {
  try {
    const hash = crypto.createHash("sha512");
    hash.update(pin);
    return hash.digest("hex");
  } catch (error) {
    console.error("Error hashing password:", error);
  }
}
