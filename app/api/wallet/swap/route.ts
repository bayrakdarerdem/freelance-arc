import { NextRequest, NextResponse } from "next/server";
import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

export async function POST(req: NextRequest) {
  try {
    const { amount, direction } = await req.json();

    const adapter = createCircleWalletsAdapter({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });

    const kit = new AppKit();

    const tokenIn = direction === "EURC_TO_USDC" ? "EURC" : "USDC";
    const tokenOut = direction === "EURC_TO_USDC" ? "USDC" : "EURC";

    const result = await kit.swap({
      from: { adapter, chain: "Arc_Testnet", address: process.env.CLIENT_WALLET_ADDRESS as `0x${string}` },
      tokenIn,
      tokenOut,
      amountIn: amount || "1.00",
      config: { kitKey: process.env.NEXT_PUBLIC_KIT_KEY as string },
    });

    return NextResponse.json({ success: true, message: "Swap completed successfully", result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
