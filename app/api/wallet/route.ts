import { getWalletUUIDandAccessKey } from "@/utils/tee";
import { Magic } from "@magic-sdk/admin";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const magic = await Magic.init(process.env.MAGIC_SECRET_KEY);

export async function GET(req: NextRequest) {
  try {
    console.log(req.nextUrl.searchParams.get("didToken"));
    const didToken = req.nextUrl.searchParams.get("didToken") ?? "";

    const userMetadata = await magic.users.getMetadataByToken(didToken);
    const publicAddress = userMetadata.publicAddress ?? "";

    const result = await getWalletUUIDandAccessKey(publicAddress);

    return NextResponse.json({ wallet_address: result.wallet_address });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
