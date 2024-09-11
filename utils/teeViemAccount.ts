import type { Hex } from "viem";
import { toAccount } from "viem/accounts";
import { signTransaction } from "./tee";

export function teeViemAccount(
  address: `0x${string}`,
  access_key: string,
  wallet_id: string,
) {
  const account = toAccount({
    address: address,
    async signMessage({ message }) {
      console.log("Sign Message", message);
      return "0x";
    },

    async signTransaction(transaction, options) {
      if (!options) {
        throw Error("Options missing");
      }
      const signedTx = await signTransaction({
        payload: mapToTEETransaction(transaction),
        access_key,
        wallet_id,
      });
      console.log("Signed transaction", transaction, signedTx);

      return signedTx;
    },

    async signTypedData(): Promise<Hex> {
      return "0x";
    },
  });
  return account;
}

function mapToTEETransaction(input: any) {
  return {
    type: 2,
    to: input.to,
    data: input.data || "0x",
    value: "0x" + BigInt(0).toString(16),
    gas: Number(input.gas),
    maxFeePerGas: Number(input.maxFeePerGas),
    maxPriorityFeePerGas: Number(input.maxPriorityFeePerGas),
    nonce: input.nonce,
    chainId: input.chainId,
  };
}
