import { useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { LoadingIcon } from "./LoadingIcon";

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col gap-2">
        {contracts.map((c: { key: number; address: string; name: string }) => (
          <div key={c.key} className="flex items-center gap-2">
            <div className="flex flex-col border p-3 rounded-md">
              <p>Name: {c.name}</p>
              <p>
                Address: <span className="font-mono">{c.address}</span>
              </p>
            </div>
            <Button className="bg-red-500" onClick={() => onRemove(c.key)}>
              X
            </Button>
          </div>
        ))}
      </div>

      {errorMessage && <p className="text-red-500 mt-3">{errorMessage}</p>}

      <form onSubmit={onUpload} className="flex w-full flex-col gap-4 mt-4">
        <Input
          className="grow mr-2 rounded"
          value={name}
          placeholder={"Enter a name"}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          className="grow mr-2 rounded"
          value={address}
          placeholder={"Enter a contract address"}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
          <div
            role="status"
            className={`${isLoading ? "" : "hidden"} flex justify-center`}
          >
            <LoadingIcon />
            <span className="sr-only">Loading...</span>
          </div>

          <span className={isLoading ? "hidden" : ""}>Send</span>
        </Button>
      </form>
    </Modal>
  );
}

function Modal(props: { isOpen: boolean; onClose: () => void; children: any }) {
  const ref = useRef<any>();

  useEffect(() => {
    if (props.isOpen) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [props.isOpen]);

  return (
    <dialog
      className="p-5 rounded-md min-w-[500px]"
      ref={ref}
      onCancel={props.onClose}
    >
      <div className="flex flex-col">
        <button className="self-end mb-5" onClick={props.onClose}>
          Close
        </button>
        {props.children}
      </div>
    </dialog>
  );
}
