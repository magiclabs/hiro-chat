"use client";

import React, { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { useMagic } from "@/components/MagicProvider";
import { LoadingIcon } from "@/components/LoadingIcon";
import { Button } from "@/components/ui/button";
import { UploadContractModal } from "@/components/UploadContractModal";
import { ContractItem } from "@/components/ContractItem";
import { useContracts } from "@/utils/useContracts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditContractModal } from "@/components/EditContractModal";
import { ConfirmAlert } from "@/components/ConfirmAlert";

export default function Page() {
  const { contracts } = useContracts();
  const [editContractKey, setEditContractKey] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { teeWalletAddress, isLoggedIn, handleLogin, handleLogout, isLoading } =
    useMagic();

  return (
    <div className="flex flex-col h-screen">
      {isLoading ? (
        <div className="flex-1 items-center flex justify-center">
          <LoadingIcon className="text-black" />
        </div>
      ) : isLoggedIn ? (
        <>
          <div className="flex flex-1 overflow-hidden">
            {/* Comment to hide side nav */}
            {process.env.NODE_ENV === "development" && (
              <div className="hidden w-96 flex-col border-r bg-card p-4 sm:flex">
                <div className="grid gap-2 text-foreground">
                  <div className="px-2 text-xs font-medium text-muted-foreground">
                    Uploaded Contracts
                  </div>

                  <ScrollArea className="max-h-[calc(100vh-11rem)]">
                    <div className="grid gap-2">
                      {contracts.map((contract) => (
                        <ContractItem
                          key={contract.key}
                          contract={contract}
                          onEdit={() => setEditContractKey(contract.key)}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    Upload Contract
                  </Button>
                </div>
              </div>
            )}

            {/* Remove div with id=temp if enabling side nav */}
            <div id="temp" className="flex-1 overflow-hidden flex flex-col">
              {/* Top Navigation */}
              <nav className="bg-background text-primary p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Magic Chat Prototype</h1>
                <div className="flex gap-4 items-center">
                  {teeWalletAddress && (
                    <p className="opacity-50 hidden md:block text-sm">
                      TEE Wallet: {teeWalletAddress}
                    </p>
                  )}

                  <Button onClick={() => setIsSettingsModalOpen(true)}>
                    Settings
                  </Button>
                  <ConfirmAlert
                    onConfirm={handleLogout}
                    button={<Button>Logout</Button>}
                    description="Are you sure you want to logout?"
                  />
                </div>
              </nav>

              <ChatWindow
                isSettingsOpen={isSettingsModalOpen}
                onCloseSettings={() => setIsSettingsModalOpen(false)}
              />
            </div>
          </div>

          <EditContractModal
            contractKey={editContractKey}
            onClose={() => setEditContractKey(null)}
          />

          <UploadContractModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
          />
        </>
      ) : (
        <div className="flex-1 items-center flex justify-center">
          <Button onClick={handleLogin}>Login</Button>
        </div>
      )}
    </div>
  );
}
