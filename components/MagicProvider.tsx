"use client";

import { Magic } from "magic-sdk";
import { ethers, BrowserProvider } from "ethers";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePinInput } from "./PinInput";

// Create and export the context
export const MagicContext = createContext<{
  magic: Magic | null;
  provider: BrowserProvider | null;
  handleLogout: () => void;
  handleLogin: (email: string) => void;
  teeWalletAddress: string | null;
  didToken: string | null;
}>({
  magic: null,
  provider: null,
  handleLogout: () => {},
  handleLogin: () => {},
  teeWalletAddress: null,
  didToken: null,
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: any) => {
  const [magic, setMagic] = useState<Magic | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [teeWalletAddress, setTEEWalletAddress] = useState<string | null>(null);

  const [didToken, setDidToken] = useState<string | null>(
    typeof window === "undefined" ? null : localStorage.getItem("didToken"),
  );

  const { getPin, pinInput } = usePinInput({
    title: "Enter your Wallet PIN",
    description:
      "You will be asked to enter this value whenever you try to execute a transaction",
    allowCancel: false,
  });

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY || "", {
        network: {
          rpcUrl: "<https://rpc2.sepolia.org/>",
          chainId: 11155111,
        },
      });
      setMagic(magic);
      const web3Provider = new ethers.BrowserProvider(magic.rpcProvider);
      setProvider(web3Provider);
    } else {
      console.error("NEXT_PUBLIC_MAGIC_API_KEY is not set");
    }
  }, []);

  useEffect(() => {
    if (!didToken) return;

    const getTEEAddress = async () => {
      let response = await fetch(`/api/wallet?didToken=${didToken}`);
      if (!response.ok) {
        const pin = await getPin();
        response = await fetch(`/api/wallet?didToken=${didToken}&pin=${pin}`);
      }
      const json = await response.json();
      setTEEWalletAddress(json.wallet_address);
    };

    getTEEAddress();
  }, [didToken, getPin]);

  const handleLogin = async (email: string) => {
    if (!magic) return;

    const didToken = await magic.auth.loginWithEmailOTP({
      email,
      showUI: true,
    });
    if (didToken) localStorage.setItem("didToken", didToken);
    setDidToken(didToken);
  };

  const handleLogout = async () => {
    if (!magic) return;
    await magic.user.logout();
    setDidToken(null);
    localStorage.removeItem("didToken");
    setTEEWalletAddress(null);
  };

  const value = useMemo(() => ({ magic, provider }), [magic, provider]);

  return (
    <MagicContext.Provider
      value={{
        ...value,
        teeWalletAddress,
        handleLogout,
        handleLogin,
        didToken,
      }}
    >
      {children}
      {pinInput}
    </MagicContext.Provider>
  );
};

export default MagicProvider;
