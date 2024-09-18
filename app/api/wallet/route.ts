import { getWalletUUIDandAccessKey } from "@/utils/tee";
import { Magic } from "@magic-sdk/admin";
import { NextRequest, NextResponse } from "next/server";
import { hashPin } from "@/utils/tee";

export const runtime = "nodejs";
const magic = await Magic.init(process.env.MAGIC_SECRET_KEY);

export async function GET(req: NextRequest) {
  try {
    const didToken = req.nextUrl.searchParams.get("didToken") ?? "";
    const pin = req.nextUrl.searchParams.get("pin");

    if (!didToken) throw new Error("TOKEN missing");

    const userMetadata = await magic.users.getMetadataByToken(didToken);
    const publicAddress = userMetadata.publicAddress ?? "";
    const encryptionContext = pin ? await hashPin(pin) : undefined;

    try {
      const result = await getWalletUUIDandAccessKey(
        publicAddress,
        encryptionContext,
      );
      return NextResponse.json({ wallet_address: result.wallet_address });
    } catch (e) {
      return NextResponse.json(
        { error: "Wallet does not exist and no PIN was provided" },
        { status: 400 },
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
