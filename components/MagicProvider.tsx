"use client";

import { Magic } from "magic-sdk";
import { Web3 } from "web3";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Create and export the context
export const MagicContext = createContext<{
  magic: Magic | null;
  web3: Web3 | null;
  handleLogout: () => void;
  handleLogin: () => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  address: string | null;
  didToken: string | null;
}>({
  magic: null,
  web3: null,
  handleLogout: () => {},
  handleLogin: () => {},
  isLoggedIn: false,
  isLoading: false,
  address: null,
  didToken: null,
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: any) => {
  const [magic, setMagic] = useState<Magic | null>(null);
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [address, setAddress] = useState<string | null>(null);
  const [didToken, setDidToken] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MAGIC_API_KEY) {
      const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_API_KEY || "", {
        network: {
          rpcUrl: "https://api.helium.fhenix.zone/",
          chainId: 8008135,
        },
      });
      setMagic(magic);
      let web3 = new Web3(magic.rpcProvider);
      setWeb3(web3);
    } else {
      console.error("NEXT_PUBLIC_MAGIC_API_KEY is not set");
    }
  }, []);

  useEffect(() => {
    if (!magic) return;
    const checkIfLoggedIn = async () => {
      setIsLoading(true);
      const isLoggedIn = await magic.user.isLoggedIn();
      setIsLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        let userInfo = await magic.user.getInfo();
        let address = userInfo.publicAddress;
        setAddress(address);
        let didToken = await magic.user.getIdToken();
        setDidToken(didToken);
      }
      setIsLoading(false);
    };
    checkIfLoggedIn();
  }, [magic]);

  const handleLogin = async () => {
    if (!magic) return;
    const isLoggedIn = await magic.user.isLoggedIn();
    setIsLoggedIn(isLoggedIn);
    if (!isLoggedIn) {
      let addresses = await magic.wallet.connectWithUI();
      setAddress(addresses[0]);
      setIsLoggedIn(true);
    } else {
      let userInfo = await magic.user.getInfo();
      let didToken = await magic.user.getIdToken();
      let address = userInfo.publicAddress;
      setAddress(address);
      setDidToken(didToken);
    }
  };

  const handleLogout = async () => {
    if (!magic) return;
    await magic.user.logout();
    setIsLoggedIn(false);
    setDidToken(null);
    setAddress(null);
  };

  const value = useMemo(() => {
    return {
      magic,
      web3,
    };
  }, [magic, web3]);

  return (
    <MagicContext.Provider
      value={{
        ...value,
        isLoading,
        handleLogout,
        handleLogin,
        isLoggedIn,
        address,
        didToken,
      }}
    >
      {children}
    </MagicContext.Provider>
  );
};

export default MagicProvider;
