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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { NETWORKS } from "@/constants";
import { IContract, NetworkEnum } from "@/types";

export function UploadContractModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [network, setNetwork] = useState<NetworkEnum | "">("");
  const [contracts, setContracts] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onUpload = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const resp = await fetch("/api/contracts", {
      method: "POST",
      body: JSON.stringify({ address, name, network }),
    });
    const json = await resp.json();

    if (json.error) {
      setErrorMessage(json.error);
    } else {
      onResetForm();
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

  const onResetForm = () => {
    setErrorMessage("");
    setAddress("");
    setNetwork("");
    setName("");
    setIsLoading(false);
  };

  useEffect(() => {
    onResetForm();
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
              {contracts.map((contract: IContract) => (
                <ContractItem
                  key={contract.key}
                  contract={contract}
                  onRemove={onRemove}
                />
              ))}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={onUpload} className="flex w-full flex-col gap-4 mt-4">
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter a name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                placeholder="Enter a contract address"
                onChange={(e) => setAddress(e.target.value)}
                className="col-span-3"
              />
            </div>

            <NetworkSelect network={network} setNetwork={setNetwork} />
          </div>

          <DialogFooter>
            {errorMessage && (
              <p className="text-red-500 mt-3">{errorMessage}</p>
            )}

            <Button type="submit" disabled={isLoading || !name || !address}>
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

const ContractItem = (props: {
  contract: IContract;
  onRemove: (key: number) => void;
}) => (
  <div className="flex items-center gap-2 border p-3 rounded-md">
    <div className="flex flex-col">
      <p>
        <span className="font-bold">Name:</span> {props.contract.name}
      </p>
      <p>
        <span className="font-bold">Address:</span>{" "}
        <span className="font-mono">{props.contract.address}</span>
      </p>
      <p>
        <span className="font-bold">Network:</span>{" "}
        <span>{props.contract.network}</span>
      </p>
    </div>
    <X
      onClick={() => props.onRemove(props.contract.key)}
      className="h-4 w-4 cursor-pointer"
    />
  </div>
);

const NetworkSelect = (props: {
  network: NetworkEnum | "";
  setNetwork: (network: NetworkEnum) => void;
}) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor="network">Network</Label>
    <Select value={props.network} onValueChange={props.setNetwork}>
      <SelectTrigger>
        <SelectValue placeholder="Select a network" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.entries(NETWORKS).map(([key, value]) => (
            <SelectItem key={key} value={key}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);
