import useSWR from "swr";
import { IContract } from "@/types";
import { useState } from "react";

export const useContracts = () => {
  const [erroMessage, setErrorMessage] = useState("");
  const {
    data: contracts = [],
    error,
    mutate: mutateContracts,
  } = useSWR<IContract[]>("/api/contracts", fetcher);

  const onUpload = async (props: {
    address: string;
    name: string;
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

  return {
    contracts,
    isLoading: !error && !contracts,
    errorMessage: erroMessage || error?.message || "",
    setErrorMessage,
    onUpload,
    onRemove,
  };
};

const fetcher = (url: string) =>
  fetch(url).then((res) => res.json().then((d) => d.contracts as IContract[]));
