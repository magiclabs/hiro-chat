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

import * as React from "react";
import { ChevronsUpDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "./ui/card";
import { Textarea } from "./ui/textarea";

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
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [openDescriptionIndex, setOpenDescriptionIndex] = useState(-1);
  const [abiDescriptions, setAbiDescriptions] = useState<
    IABIFunctionDescription[] | undefined
  >();

  const contract = contracts.find((c) => c.key === contractKey);
  const onResetForm = useCallback(() => {
    setName(contract?.name ?? "");
    setDescription(contract?.description ?? "");
    setContext(contract?.context ?? "");
    setAbiDescriptions(contract?.abiDescriptions);
    setErrorMessage("");
  }, [
    contract?.name,
    contract?.description,
    contract?.context,
    contract?.abiDescriptions,
    setErrorMessage,
  ]);

  useEffect(() => {
    onResetForm();
  }, [contractKey, onResetForm]);

  if (typeof contractKey !== "number") return null;

  const updateAbiDescriptions = (
    value: string,
    descriptionIndex: number,
    inputIndex?: number,
    isValueDescription?: boolean,
  ) =>
    setAbiDescriptions((abi) => {
      return abi?.map((abiDescription, index) => {
        if (descriptionIndex !== index) return abiDescription;

        return {
          ...abiDescription,
          description:
            typeof inputIndex === "number" || isValueDescription
              ? abiDescription.description
              : value,
          valueDescription: isValueDescription
            ? value
            : abiDescription.valueDescription,
          inputs: abiDescription.inputs.map((input, i) =>
            inputIndex === i ? { ...input, description: value } : input,
          ),
        };
      });
    });

  return (
    <Dialog open={typeof contractKey === "number"} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Contract</DialogTitle>
        </DialogHeader>

        <form
          className="flex w-full flex-col overflow-y-scroll"
          onSubmit={(e) => {
            e.preventDefault();
            onEdit({
              key: contractKey,
              name,
              description,
              context,
              abiDescriptions,
            }).then(() => {
              onClose();
            });
          }}
        >
          <div className="max-h-[800px] overflow-y-scroll px-1 my-3">
            <div className="flex flex-col gap-2 my-4">
              <Label htmlFor="name">Address</Label>
              <Input
                id="address"
                placeholder="Enter a name"
                disabled
                value={contract?.address}
              />
            </div>
            <div className="flex flex-col gap-2 my-4">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter a name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 my-4">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Enter a description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2 my-4">
              <Label htmlFor="context">Context</Label>
              <Textarea
                id="context"
                placeholder="Enter a context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>

            <span className="font-[600] text-lg">Function Descriptions</span>

            <div className="flex flex-col gap-2">
              {abiDescriptions?.map((abiDescription, descriptionIndex) => (
                <FunctionDescriptionInput
                  key={descriptionIndex}
                  abiDescription={abiDescription}
                  index={descriptionIndex}
                  onChange={updateAbiDescriptions}
                  openDescriptionIndex={openDescriptionIndex}
                  setIsOpen={setOpenDescriptionIndex}
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
  openDescriptionIndex,
  setIsOpen,
}: {
  openDescriptionIndex: number;
  setIsOpen: (n: number) => void;
  abiDescription: IABIFunctionDescription;
  index: number;
  onChange: (v: string, i: number, i2?: number, b?: boolean) => void;
}) => {
  return (
    <Card>
      <CardContent className="p-4 py-2">
        <Collapsible
          open={openDescriptionIndex === index}
          onOpenChange={() =>
            setIsOpen(openDescriptionIndex === index ? -1 : index)
          }
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <span className="capitalize font-[600] truncate">
                {abiDescription.name}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-9 p-0 -mr-3"
              >
                <ChevronsUpDown className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <Label>Function Description</Label>
            <Textarea
              id={abiDescription.name}
              placeholder="Enter a description"
              className="min-h-[100px]"
              value={abiDescription.description}
              onChange={(e) => onChange(e.target.value, index)}
            />

            <p className="mt-2 font-[600]">Inputs</p>

            <div className="mt-2">
              <div className="mb-2">
                <Label htmlFor="name">Transaction Value</Label>
                <Input
                  placeholder="Enter a description"
                  value={abiDescription.valueDescription}
                  onChange={(e) =>
                    onChange(e.target.value, index, undefined, true)
                  }
                />
              </div>

              {abiDescription.inputs.map((input, inputIndex) => (
                <div key={inputIndex} className="mb-2">
                  <Label htmlFor="name">{input.name}</Label>
                  <Input
                    placeholder="Enter a description"
                    value={input.description}
                    onChange={(e) =>
                      onChange(e.target.value, index, inputIndex)
                    }
                  />
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
