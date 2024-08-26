import { getAbi } from "./etherscan";
import { createModularAccountAlchemyClient } from "@alchemy/aa-alchemy";
import { SmartAccountSigner, sepolia } from "@alchemy/aa-core";
import { Address } from "abitype";
import { encodeFunctionData, Hex, SignableMessage } from "viem";
import { getWalletUUIDandAccessKey } from "./tee";

const GAS_MANAGER_POLICY_ID = process.env.GAS_MANAGER_POLICY_ID ?? "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY ?? "";

export async function getTransactionReceiptWithPaymaster({
  contractAddress,
  functionName,
  args,
  publicAddress,
}: {
  contractAddress: string;
  functionName: string;
  args: any[];
  publicAddress: string;
}): Promise<any> {
  try {
    const [abi, { wallet_id, wallet_address, access_key }] = await Promise.all([
      getAbi(contractAddress),
      getWalletUUIDandAccessKey(publicAddress),
    ]);

    const signer = new CustomSigner(
      wallet_address as `0x${string}`,
      access_key,
      wallet_id,
    );

    const smartAccountClient = await createModularAccountAlchemyClient({
      apiKey: ALCHEMY_API_KEY,
      chain: sepolia,
      // @ts-ignore
      signer,
      gasManagerConfig: { policyId: GAS_MANAGER_POLICY_ID },
    });

    const data = encodeFunctionData({
      abi: JSON.parse(abi),
      functionName,
      args,
    });
    console.log({ data });
    const uo = await smartAccountClient.sendUserOperation({
      uo: { target: contractAddress as `0x${string}`, data },
    });
    console.log({ uo });

    const txHash = await smartAccountClient.waitForUserOperationTransaction(uo);
    console.log({ txHash });

    return { transactionHash: txHash, error: null, signedTx: "" };
  } catch (error) {
    console.log(error);
    return { error: "", transactionHash: "", signedTx: "" };
  }
}

class CustomSigner implements SmartAccountSigner {
  signerType = "CustomSigner";
  inner: any;
  address: `0x${string}`;
  access_key: string;
  wallet_id: string;

  constructor(address: `0x${string}`, access_key: string, wallet_id: string) {
    this.address = address;
    this.access_key = access_key;
    this.wallet_id = wallet_id;
  }

  async getAddress(): Promise<Address> {
    console.log("called getAddress", this.address);
    return this.address;
  }

  async signMessage(message: SignableMessage): Promise<Hex> {
    console.log("called signMessage", message);

    // const response = await axiosInstance.post("/wallet/sign_transaction", {
    //   payload: message.raw,
    //   encryption_context: "0000",
    //   access_key: this.access_key,
    //   wallet_id: this.wallet_id,
    // });
    // // console.log({ response });
    // return response.data.data.signed_transaction;
    // if (response.status !== 200 || !signedTx) {
    //   throw new Error("Failed to sign message via backend service");
    // }
    // return signedTx
    return "0xtest";
  }

  async signTypedData(): Promise<Hex> {
    // throw new Error("Failed to sign typed data via backend service");
    return "0xtest";
  }
}
