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
  handleLogin: () => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  teeWalletAddress: string | null;
  didToken: string | null;
}>({
  magic: null,
  provider: null,
  handleLogout: () => {},
  handleLogin: () => {},
  isLoggedIn: false,
  teeWalletAddress: null,
  isLoading: false,
  didToken: null,
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: any) => {
  const [magic, setMagic] = useState<Magic | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teeWalletAddress, setTEEWalletAddress] = useState<string | null>(null);

  const [didToken, setDidToken] = useState<string | null>(null);

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
    if (!magic) return;

    const checkIfLoggedIn = async () => {
      setIsLoading(true);

      try {
        const didToken = await magic.user.getIdToken();
        setDidToken(didToken);
        setIsLoggedIn(true);
      } catch (e) {
        setIsLoggedIn(false);
      }

      setIsLoading(false);
    };
    checkIfLoggedIn();
  }, [magic]);

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

  const handleLogin = async () => {
    if (!magic) return;
    const isLoggedIn = await magic.user.isLoggedIn();
    setIsLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      await magic.wallet.connectWithUI();
      setIsLoggedIn(true);
    }
    const didToken = await magic.user.getIdToken();
    setDidToken(didToken);
  };

  const handleLogout = async () => {
    if (!magic) return;
    await magic.user.logout();
    setIsLoggedIn(false);
    setDidToken(null);
    setTEEWalletAddress(null);
  };

  const value = useMemo(() => ({ magic, provider }), [magic, provider]);

  return (
    <MagicContext.Provider
      value={{
        ...value,
        teeWalletAddress,
        isLoading,
        handleLogout,
        handleLogin,
        isLoggedIn,
        didToken,
      }}
    >
      {children}
      {pinInput}
    </MagicContext.Provider>
  );
};

export default MagicProvider;
