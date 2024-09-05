import { useCallback, useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LoadingIcon } from "./LoadingIcon";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { useContracts } from "../utils/useContracts";
import { ConfirmAlert } from "./ConfirmAlert";

export function EditContractModal({
  contractKey,
  onClose,
}: {
  contractKey: number | null;
  onClose: () => void;
}) {
  const {
    contracts,
    onRemove,
    onEdit,
    setErrorMessage,
    errorMessage,
    isLoading,
  } = useContracts();
  const [name, setName] = useState("");

  const onResetForm = useCallback(() => {
    const contract = contracts.find((c) => c.key === contractKey);
    setName(contract?.name ?? "");
    setErrorMessage("");
  }, [contracts, contractKey, setErrorMessage]);

  useEffect(() => {
    onResetForm();
  }, [contractKey, onResetForm]);

  if (!contractKey) return null;

  return (
    <Dialog open={!!contractKey} onOpenChange={onClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Edit Contract</DialogTitle>
        </DialogHeader>

        <form
          className="flex w-full flex-col gap-4 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            onEdit({ key: contractKey, name }).then(() => {
              onClose();
            });
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter a name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            {errorMessage && (
              <p className="text-red-500 mt-3">{errorMessage}</p>
            )}

            <ConfirmAlert
              onConfirm={() => onRemove(contractKey).then(onClose)}
              button={
                <Button className="bg-red-500" title="Delete">
                  Delete
                </Button>
              }
              description="This will delete the contract"
            />
            <Button type="submit" disabled={isLoading || !name}>
              <div
                role="status"
                className={`${isLoading ? "" : "hidden"} flex justify-center`}
              >
                <LoadingIcon />
                <span className="sr-only">Loading...</span>
              </div>

              <span className={isLoading ? "hidden" : ""}>Save</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
