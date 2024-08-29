"use client";

import React, { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { useMagic } from "@/components/MagicProvider";
import { LoadingIcon } from "@/components/LoadingIcon";
import { Button } from "@/components/ui/button";
import {
  ContractItem,
  UploadContractModal,
} from "@/components/UploadContractModal";
import { useContracts } from "@/utils/useContracts";

export default function Page() {
  const { contracts, onRemove } = useContracts();
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
              <div className="grid gap-2 p-2 text-foreground">
                <div className="px-2 text-xs font-medium text-muted-foreground">
                  Uploaded Contracts
                </div>

                {contracts.map((contract) => (
                  <ContractItem
                    key={contract.address + contract.chainId}
                    contract={contract}
                    onRemove={onRemove}
                  />
                ))}
                <Button onClick={() => setIsModalOpen(true)}>
                  Upload Contract
                </Button>
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
