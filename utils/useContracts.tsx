import useSWR from "swr";
import { IABIFunctionDescription, IContract } from "@/types";
import { useState } from "react";
import useLocalStorage from "./useLocalStorage";

export const useContracts = () => {
  const [erroMessage, setErrorMessage] = useState("");
  const [disabledKeys, setDisabledKeys] = useLocalStorage<number[]>(
    "disabled-contracts",
    [],
  );
  const {
    data: contracts = [],
    error,
    mutate: mutateContracts,
  } = useSWR<IContract[]>("/api/contracts", fetcher);

  const onUpload = async (props: {
    address: string;
    name: string;
    description: string;
    chainId: number;
    abi?: string;
  }) => {
    setErrorMessage("");

    return await mutateContracts(
      async () => {
        const resp = await fetch("/api/contracts", {
          method: "POST",
          body: JSON.stringify(props),
        });
        const json = await resp.json();

        if (json.error) {
          setErrorMessage(json.error);
        }

        if (json.contracts) {
          return json.contracts;
        }
      },
      { revalidate: true },
    );
  };

  const onRemove = async (key: number) => {
    setErrorMessage("");

    return await mutateContracts(
      async () => {
        const resp = await fetch("/api/contracts", {
          method: "DELETE",
          body: JSON.stringify({ key }),
        });
        const json = await resp.json();

        if (json.error) {
          setErrorMessage(json.error);
        }

        if (json.contracts) {
          return json.contracts;
        }
      },
      { revalidate: true },
    );
  };

  const onEdit = async (props: {
    key: number;
    name?: string;
    description?: string;
    context?: string;
    abiDescriptions?: IABIFunctionDescription[];
  }) => {
    setErrorMessage("");

    return await mutateContracts(
      async () => {
        const resp = await fetch("/api/contracts", {
          method: "PATCH",
          body: JSON.stringify(props),
        });
        const json = await resp.json();

        if (json.error) {
          setErrorMessage(json.error);
        }

        if (json.contracts) {
          return json.contracts;
        }
      },
      { revalidate: true },
    );
  };

  return {
    disabledKeys,
    setDisabledKeys,
    contracts,
    isLoading: !error && !contracts,
    errorMessage: erroMessage || error?.message || "",
    setErrorMessage,
    onUpload,
    onRemove,
    onEdit,
  };
};

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json().then((d) => d.contracts as IContract[]));
