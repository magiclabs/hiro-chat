import { IContract } from "@/types";
import { createAlchemySmartAccountClient, sepolia } from "@account-kit/infra";
import { createLightAccount } from "@account-kit/smart-contracts";
import { WalletClientSigner } from "@aa-sdk/core";
import { Hex, createWalletClient, encodeFunctionData, http } from "viem";
import { getAbi } from "./abi";
import { getWalletUUIDandAccessKey } from "./tee";
import { teeViemAccount } from "./teeViemAccount";
import { CHAINS } from "@/constants";
import { LocalAccountSigner } from "@aa-sdk/core";
import { generatePrivateKey } from "viem/accounts";

const GAS_MANAGER_POLICY_ID = process.env.GAS_MANAGER_POLICY_ID ?? "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY ?? "";

export async function getTransactionReceiptWithPaymaster({
  contract,
  functionName,
  value,
  args,
  publicAddress,
}: {
  contract: IContract;
  functionName: string;
  value: number;
  args: any[];
  publicAddress: string;
}): Promise<any> {
  try {
    const client = await getAlchemySmartAccountClient(publicAddress);

    const abi = await getAbi(contract.address, contract.chainId);
    const data = encodeFunctionData({ abi, functionName, args });

    const { hash } = await client.sendUserOperation({
      uo: {
        target: contract.address as Hex,
        data: data,
        value: BigInt(value),
      },
    });

    console.log({ hash });

    return { transactionHash: "", error: null, signedTx: "" };
  } catch (error) {
    console.log(error);
    return { error: "", transactionHash: "", signedTx: "" };
  }
}

const getAlchemySmartAccountClient = async (address?: string) => {
  const chain = sepolia;
  const transport = http(`${CHAINS[11155111].rpcURI}${ALCHEMY_API_KEY}`);
  let signer: WalletClientSigner | any;

  if (address) {
    const { wallet_id, wallet_address, access_key } =
      await getWalletUUIDandAccessKey(address);

    const viemWalletClient = createWalletClient({
      account: teeViemAccount(wallet_address as Hex, access_key, wallet_id),
      chain,
      transport,
    });

    signer = new WalletClientSigner(viemWalletClient, "json-rpc");
  } else {
    // if no address is provided, generate a signer with a new private key for sanity test
    signer = LocalAccountSigner.privateKeyToAccountSigner(generatePrivateKey());
  }

  const account = await createLightAccount({ chain, transport, signer });

  return createAlchemySmartAccountClient({
    apiKey: ALCHEMY_API_KEY,
    policyId: GAS_MANAGER_POLICY_ID,
    chain,
    account,
  });
};
