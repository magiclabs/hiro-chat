"use client";

import React, { useState } from "react";
import { ChatWindow } from "@/components/ChatWindow";
import { useMagic } from "@/components/MagicProvider";
import { LoadingIcon } from "@/components/LoadingIcon";
import { Button } from "@/components/ui/button";
import { UploadContractModal } from "@/components/UploadContractModal";
import { ContractItem } from "@/components/ContractItem";
import { useContracts } from "@/utils/hooks/useContracts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditContractModal } from "@/components/EditContractModal";
import { ConfirmAlert } from "@/components/ConfirmAlert";
import { ChatSettingsModal } from "@/components/ChatSettingsModal";
import { shortenAddress } from "@/utils/shortenAddress";
import { toast } from "sonner";
import { useChat } from "@/components/ChatProvider";

const CONTRACT_UPLOAD_ENABLED =
  process.env.NEXT_PUBLIC_ALLOW_CONTRACT_UPLOAD === "1";

export default function Page() {
  const { contracts } = useContracts();
  const [editContractKey, setEditContractKey] = useState<number | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { teeWalletAddress, isLoggedIn, handleLogin, handleLogout, isLoading } =
    useMagic();
  const { modelName } = useChat();

  return (
    <div className="flex flex-col h-screen">
      {isLoading ? (
        <div className="flex-1 items-center flex justify-center">
          <LoadingIcon className="text-black" />
        </div>
      ) : isLoggedIn ? (
        <>
          <div className="flex flex-1 overflow-hidden">
            <div className="hidden w-72 md:w-96 flex-col border-r bg-card p-4 sm:flex">
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
                        onEdit={
                          CONTRACT_UPLOAD_ENABLED
                            ? () => setEditContractKey(contract.key)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </ScrollArea>
                {CONTRACT_UPLOAD_ENABLED && (
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    Upload Contract
                  </Button>
                )}
              </div>
            </div>

            <div id="temp" className="flex-1 overflow-hidden flex flex-col">
              {/* Top Navigation */}
              <nav className="bg-background border-b text-primary p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Magic Chat Prototype</h1>
                <div className="flex gap-4 items-center">
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

              <div className="flex-1">
                <ChatWindow />
              </div>

              <div className="p-4 opacity-50 text-sm flex justify-between">
                {teeWalletAddress && (
                  <p
                    className="cursor-pointer"
                    onClick={() => {
                      toast("Copied to clipboard");
                      navigator.clipboard.writeText(teeWalletAddress);
                    }}
                  >
                    Wallet Address: {shortenAddress(teeWalletAddress)}
                  </p>
                )}

                <p>Model: {modelName}</p>
              </div>
            </div>
          </div>

          <ChatSettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
          />

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
