import { Pencil, Circle, CircleCheck } from "lucide-react";
import { CHAINS } from "@/constants";
import { IContract } from "@/types";
import { shortenAddress } from "@/utils/shortenAddress";
import { useContracts } from "@/utils/hooks/useContracts";

export const ContractItem = (props: {
  contract: IContract;
  onEdit?: (key: number) => void;
}) => {
  const { disabledKeys, setDisabledKeys } = useContracts();
  const isDisabled = disabledKeys.includes(props.contract.key);
  const DisabledIcon = isDisabled ? Circle : CircleCheck;
  return (
    <div className="border p-3 rounded-md">
      <div
        className={`flex items-center gap-2 ${isDisabled ? "opacity-50" : ""}`}
      >
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

        {props.onEdit && (
          <Pencil
            onClick={() => props.onEdit?.(props.contract.key)}
            className="h-4 w-4 cursor-pointer"
          />
        )}

        <DisabledIcon
          className="h-4 w-4 cursor-pointer"
          onClick={() =>
            isDisabled
              ? setDisabledKeys(
                  disabledKeys.filter((k) => k !== props.contract.key),
                )
              : setDisabledKeys([...disabledKeys, props.contract.key])
          }
        />
      </div>
    </div>
  );
};
