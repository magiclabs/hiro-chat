"use client";

import React, { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { useMagic } from "@/components/MagicProvider";
import { LoadingIcon } from "@/components/LoadingIcon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UploadContractModal } from "@/components/UploadContractModal";

const exampleContracts = [
  {
    contractAddresses: [
      "0xb6A8F9612Db4BA200398122073F39E917e885232",
      "0xa8A71760b77F85cEF6aBc7DF34AcA38d753b63EA",
      "0xa807e2a221c6daafe1b4a3ed2da5e8a53fdaf6be",
      "0x9Db3197eec02B963151eEdf3C65Ac844197105C3",
    ],
    network: "sepolia",
    name: "Multi Contract test",
    description:
      "Combines 0xb6A8F9612Db4BA200398122073F39E917e885232, 0xa8A71760b77F85cEF6aBc7DF34AcA38d753b63EA, 0xa807e2a221c6daafe1b4a3ed2da5e8a53fdaf6be and 0x9Db3197eec02B963151eEdf3C65Ac844197105C3",
  },
  {
    contractAddresses: ["0xa8A71760b77F85cEF6aBc7DF34AcA38d753b63EA"],
    network: "sepolia",
    name: "SimpleNFT",
    description: "Contract Dan created for NFT onlyOwner minting",
  },
  {
    contractAddresses: ["0xb6A8F9612Db4BA200398122073F39E917e885232"],
    network: "sepolia",
    name: "Mo Test Token",
    description: "Contract Mo created for NFT public minting",
  },
  {
    contractAddresses: ["0xa807e2a221c6daafe1b4a3ed2da5e8a53fdaf6be"],
    network: "sepolia",
    name: "PudgyPenguins",
    description:
      "Publicly available NFT contract for minting. Throws TEE error",
  },
  {
    contractAddresses: ["0xbd3531da5cf5857e7cfaa92426877b022e612cf8"],
    network: "mainnet",
    name: "PudgyPenguins",
    description: "",
  },
  {
    contractAddresses: ["0x9Db3197eec02B963151eEdf3C65Ac844197105C3"],
    network: "sepolia",
    name: "TestApe",
    description: "Publicly available NFT contract for minting. Happy Path",
  },
  {
    contractAddresses: ["0xdac17f958d2ee523a2206206994597c13d831ec7"],
    network: "mainnet",
    name: "Tether USD",
    description: "",
  },
  {
    contractAddresses: ["0x40f48526fdca9bc212e8150cc44491b1acf018da"],
    network: "mainnet",
    name: "Saints and Sinners",
    description: "",
  },
];

export default function Page() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { magic, isLoggedIn, handleLogin, handleLogout, isLoading } =
    useMagic();

  return (
    <div className="flex flex-1">
      {isLoading ? (
        <div className="flex-1 h-screen items-center flex justify-center">
          <LoadingIcon className="text-black" />
        </div>
      ) : isLoggedIn ? (
        <>
          {/* Comment to hide side nav */}
          {process.env.NODE_ENV === "development" && (
            <div className="hidden w-96 flex-col border-r bg-card p-4 sm:flex">
              <div className="grid gap-1 p-2 text-foreground">
                <div className="px-2 text-xs font-medium text-muted-foreground">
                  Example Contracts
                </div>

                {exampleContracts.map((contract) => (
                  <Link
                    key={contract.description}
                    href={`/?contractAddresses=${contract.contractAddresses.join(
                      ",",
                    )}&network=${contract.network}`}
                    title={contract.description}
                    className="flex-1 block p-2 overflow-hidden text-sm truncate transition-colors rounded-md whitespace-nowrap hover:bg-muted/50"
                  >
                    <div>
                      <span>
                        {contract.name}{" "}
                        <small className="text-muted-foreground">
                          ({contract.network})
                        </small>
                      </span>
                      <div className="font-xs text-muted-foreground">
                        {contract.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Remove div with id=temp if enabling side nav */}
          <div
            id="temp"
            className="mx-auto w-full max-w-4xl py-12 flex flex-col stretch gap-3"
          >
            <div className="flex flex-1 flex-col">
              <ChatWindow titleText="Magic Chat Prototype" />

              <div className="flex mt-4 gap-4 justify-end">
                <Button onClick={() => setIsModalOpen(true)}>
                  Upload Contract
                </Button>
                <Button onClick={() => magic?.wallet.showUI()}>
                  Show Wallet
                </Button>
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            </div>
          </div>
          <UploadContractModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </>
      ) : (
        <div className="flex-1 h-screen items-center flex justify-center">
          <Button onClick={handleLogin}>Login</Button>
        </div>
      )}
    </div>
  );
}
