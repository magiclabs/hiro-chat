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
import { IABIFunctionDescription } from "@/types";

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
  const [abiDescriptions, setAbiDescriptions] = useState<
    IABIFunctionDescription[] | undefined
  >();

  const contract = contracts.find((c) => c.key === contractKey);
  const onResetForm = useCallback(() => {
    setName(contract?.name ?? "");
    setAbiDescriptions(contract?.abiDescriptions);
    setErrorMessage("");
  }, [contract?.name, contract?.abiDescriptions, setErrorMessage]);

  useEffect(() => {
    onResetForm();
  }, [contractKey, onResetForm]);

  if (typeof contractKey !== "number") return null;

  const updateAbiDescriptions = (
    value: string,
    descriptionIndex: number,
    inputIndex?: number,
  ) =>
    setAbiDescriptions((abi) => {
      return abi?.map((abiDescription, index) => {
        if (descriptionIndex !== index) return abiDescription;

        return {
          ...abiDescription,
          description:
            typeof inputIndex === "number" ? abiDescription.description : value,
          inputs: abiDescription.inputs.map((input, i) =>
            inputIndex === i ? { ...input, description: value } : input,
          ),
        };
      });
    });

  return (
    <Dialog open={typeof contractKey === "number"} onOpenChange={onClose}>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Edit Contract</DialogTitle>
        </DialogHeader>

        <form
          className="flex w-full flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            onEdit({ key: contractKey, name, abiDescriptions }).then(() => {
              onClose();
            });
          }}
        >
          <DialogTitle>Details</DialogTitle>

          <div className="flex flex-col gap-2 my-4">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter a name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <DialogTitle>Function Descriptions</DialogTitle>

          <div className="h-[500px] overflow-y-scroll -mx-2 px-2 mt-3">
            <div className="flex flex-col gap-4">
              {abiDescriptions?.map((abiDescription, descriptionIndex) => (
                <FunctionDescriptionInput
                  key={descriptionIndex}
                  abiDescription={abiDescription}
                  index={descriptionIndex}
                  onChange={updateAbiDescriptions}
                />
              ))}
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

const FunctionDescriptionInput = ({
  abiDescription,
  index,
  onChange,
}: {
  abiDescription: IABIFunctionDescription;
  index: number;
  onChange: (v: string, i: number, i2?: number) => void;
}) => (
  <div>
    <Label>{abiDescription.name}</Label>
    <Input
      id={abiDescription.name}
      placeholder="Enter a description"
      value={abiDescription.description}
      onChange={(e) => onChange(e.target.value, index)}
    />

    <div className="mt-2">
      {abiDescription.inputs.map((input, inputIndex) => (
        <div key={inputIndex} className="mb-2 ml-4">
          <Label htmlFor="name">{input.name}</Label>
          <Input
            placeholder="Enter a description"
            value={input.description}
            onChange={(e) => onChange(e.target.value, index, inputIndex)}
          />
        </div>
      ))}
    </div>
  </div>
);
