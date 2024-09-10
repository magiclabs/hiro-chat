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

                <ScrollArea className="max-h-[calc(100vh-7rem)]">
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
          <div
            id="temp"
            className="mx-auto w-full max-w-6xl py-3 flex flex-col gap-2"
          >
            <div className="flex flex-1 flex-col">
              <ChatWindow titleText="Magic Chat Prototype" />

              <div className="flex gap-4 justify-end px-6">
                <Button onClick={() => magic?.wallet.showUI()}>
                  Show Wallet
                </Button>
                <ConfirmAlert
                  onConfirm={handleLogout}
                  button={<Button>Logout</Button>}
                  description="Are you sure you want to logout?"
                />
              </div>
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
        <div className="flex-1 h-screen items-center flex justify-center">
          <Button onClick={handleLogin}>Login</Button>
        </div>
      )}
    </div>
  );
}
