import { contractCollection } from "@/utils/collections";
import { getAbi } from "@/utils/abi";
import { NextRequest, NextResponse } from "next/server";
import { getContractABIDescriptions } from "@/utils/generateToolFromABI";
import { AbiFunction } from "abitype";

export const runtime = "nodejs";

export async function GET() {
  try {
    const contracts = await contractCollection.get();

    return NextResponse.json({ contracts }, { status: 200 });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const existingContracts = await contractCollection.get();

    if (
      existingContracts.some(
        (c) => c.address === body.address && c.chainId === body.chainId,
      )
    ) {
      throw new Error("Contract has already been uploaded");
    }

    if (!isValidEthereumAddress(body.address)) {
      throw new Error("Contract address is not valid");
    }

    let abi: AbiFunction[] = [];
    try {
      if (body.abi) {
        abi = await JSON.parse(body.abi);
      } else {
        abi = await getAbi(body.address, body.chainId);
      }
    } catch (e) {
      throw new Error("Contract ABI is not valid");
    }

    const abiDescriptions = getContractABIDescriptions(
      { key: -1, ...body },
      abi,
    );
    await contractCollection.add({
      address: body.address,
      name: body.name,
      chainId: body.chainId,
      abi,
      abiDescriptions,
    });

    const contracts = await contractCollection.get();

    return NextResponse.json({ contracts }, { status: 200 });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const existingContracts = await contractCollection.get();

    if (!existingContracts.some((c) => c.key === body.key)) {
      throw new Error("Contract doesnt exist");
    }

    await contractCollection.update({
      key: body.key,
      name: body.name,
      abiDescriptions: body.abiDescriptions,
    });

    const contracts = await contractCollection.get();

    return NextResponse.json({ contracts }, { status: 200 });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    await contractCollection.delete(body.key);
    const contracts = await contractCollection.get();

    return NextResponse.json({ contracts }, { status: 200 });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

function isValidEthereumAddress(address: string) {
  if (
    typeof address !== "string" ||
    address.length !== 42 ||
    !address.startsWith("0x")
  ) {
    return false;
  }

  const hexPattern = /^0x[0-9a-fA-F]{40}$/;
  return hexPattern.test(address);
}
