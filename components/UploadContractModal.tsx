import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LoadingIcon } from "./LoadingIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { X } from "lucide-react";

export function UploadContractModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [contracts, setContracts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // TODO: add network input

  const onUpload = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const resp = await fetch("/api/contracts", {
      method: "POST",
      body: JSON.stringify({ address, name }),
    });
    const json = await resp.json();

    if (json.error) {
      setErrorMessage(json.error);
    } else {
      setErrorMessage("");
      setAddress("");
      setName("");
    }

    setContracts(json.contracts);
    setIsLoading(false);
  };

  const onRemove = async (key: number) => {
    setIsLoading(true);
    const resp = await fetch("/api/contracts", {
      method: "DELETE",
      body: JSON.stringify({ key }),
    });
    const json = await resp.json();

    if (json.error) {
      setErrorMessage(json.error);
    } else {
      setErrorMessage("");
    }

    setContracts(json.contracts);
    setIsLoading(false);
  };

  const getContracts = async () => {
    const resp = await fetch("/api/contracts");
    const json = await resp.json();

    setErrorMessage("");
    setContracts(json.contracts);

    return json;
  };

  useEffect(() => {
    setAddress("");
    setName("");
  }, [isOpen]);

  useEffect(() => {
    getContracts();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Upload Contract</DialogTitle>
          <DialogDescription>Manage your uploaded contracts</DialogDescription>

          {contracts.length > 0 && (
            <div className="flex flex-col gap-2 pt-8">
              {contracts.map(
                (c: { key: number; address: string; name: string }) => (
                  <div
                    key={c.key}
                    className="flex items-center gap-2 border p-3 rounded-md"
                  >
                    <div className="flex flex-col">
                      <p>Name: {c.name}</p>
                      <p>
                        Address: <span className="font-mono">{c.address}</span>
                      </p>
                    </div>
                    <X
                      onClick={() => onRemove(c.key)}
                      className="h-4 w-4 cursor-pointer"
                    />
                  </div>
                ),
              )}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={onUpload} className="flex w-full flex-col gap-4 mt-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                placeholder={"Enter a name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={address}
                placeholder={"Enter a contract address"}
                onChange={(e) => setAddress(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            {errorMessage && (
              <p className="text-red-500 mt-3">{errorMessage}</p>
            )}
            <Button type="submit" disabled={isLoading}>
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
