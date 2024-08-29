import { KVCollection } from "@/utils/kvCollection";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const collection = new KVCollection<{ address: string; name: string }>(
  "contracts:",
);

export async function GET() {
  try {
    const contracts = await collection.get();

    return NextResponse.json({ contracts }, { status: 200 });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function POST(req: NextRequest) {
  const existingContracts = await collection.get();
  try {
    const body = await req.json();

    if (existingContracts.some((c) => c.address === body.address)) {
      throw new Error("Contract has already been uploaded");
    }

    if (!isValidEthereumAddress(body.address)) {
      throw new Error("Contract address is not valid");
    }

    // TODO: fetch abi and throw if not found

    await collection.add({ address: body.address, name: body.name });
    const contracts = await collection.get();

    return NextResponse.json({ contracts }, { status: 200 });
  } catch (e: any) {
    console.log(e);
    return NextResponse.json(
      { error: e.message, contracts: existingContracts },
      { status: e.status ?? 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    await collection.delete(body.key);
    const contracts = await collection.get();

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
