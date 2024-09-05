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
import { Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CHAINS } from "@/constants";
import { IContract, ChainIdEnum } from "@/types";
import { useContracts } from "../utils/useContracts";
import { shortenAddress } from "../utils/shortenAddress";
import { Textarea } from "./ui/textarea";

export function UploadContractModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { onUpload, setErrorMessage, errorMessage, isLoading } = useContracts();
  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [abi, setABI] = useState("");
  const [chainId, setChainId] = useState<ChainIdEnum | -1>(-1);

  const onResetForm = useCallback(() => {
    setAddress("");
    setChainId(-1);
    setName("");
    setABI("");
    setErrorMessage("");
  }, [setErrorMessage]);

  useEffect(() => {
    onResetForm();
  }, [isOpen, onResetForm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Upload Contract</DialogTitle>
        </DialogHeader>

        <form
          className="flex w-full flex-col gap-4 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            onUpload({ address, name, chainId, abi }).then((contracts) => {
              if (contracts) onClose();
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

            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                placeholder="Enter a contract address"
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <ChainSelect chainId={chainId} setChainId={setChainId} />

            <div className="flex flex-col gap-2">
              <Label htmlFor="abi">ABI</Label>
              <Textarea
                id="abi"
                value={abi}
                placeholder="Enter ABI"
                onChange={(e) => setABI(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            {errorMessage && (
              <p className="text-red-500 mt-3">{errorMessage}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading || !name || !address || chainId === -1}
            >
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

export const ContractItem = (props: {
  contract: IContract;
  onEdit?: (key: number) => void;
}) => (
  <div className="flex items-center gap-2 border p-3 rounded-md">
    <div className="flex flex-col flex-1">
      <span>
        {props.contract.name}{" "}
        <small className="text-muted-foreground">
          ({CHAINS[props.contract.chainId]?.name})
        </small>
      </span>
      <small className="font-xs font-mono text-muted-foreground">
        {shortenAddress(props.contract.address)}
      </small>
      {props.contract.description && (
        <small className="font-xs text-muted-foreground mt-1">
          {props.contract.description}
        </small>
      )}
    </div>
    {props.contract.key > -1 && props.onEdit && (
      <Pencil
        onClick={() => props.onEdit?.(props.contract.key!)}
        className="h-4 w-4 cursor-pointer"
      />
    )}
  </div>
);

const ChainSelect = (props: {
  chainId: ChainIdEnum | -1;
  setChainId: (chainId: ChainIdEnum) => void;
}) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor="chainId">Chain</Label>
    <Select
      value={props.chainId === -1 ? "" : `${props.chainId}`}
      onValueChange={(s) => props.setChainId(Number(s) as ChainIdEnum)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a chain" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {Object.entries(CHAINS)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([key, value]) => (
              <SelectItem key={key} value={key}>
                {value.name}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);
