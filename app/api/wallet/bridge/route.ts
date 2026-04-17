import { NextRequest, NextResponse } from "next/server";
import { AppKit } from "@circle-fin/app-kit";
import { createCircleWalletsAdapter } from "@circle-fin/adapter-circle-wallets";

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    const adapter = createCircleWalletsAdapter({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });

    const kit = new AppKit();

    const result = await kit.bridge({
      from: { 
        adapter, 
        chain: "Ethereum_Sepolia",
        address: process.env.CLIENT_WALLET_ADDRESS as `0x${string}`,
        rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
      },
      to: { 
        adapter, 
        chain: "Arc_Testnet",
        address: process.env.CLIENT_WALLET_ADDRESS as `0x${string}`,
        rpcUrl: "https://rpc.arc.dev",
      },
      amount: amount || "1.00",
    });

    return NextResponse.json({ success: true, message: "Bridge initiated", result });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
