import { NextRequest, NextResponse } from "next/server";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || !address.startsWith("0x")) {
      return NextResponse.json({ success: false, error: "Invalid wallet address" }, { status: 400 });
    }

    const circle = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });

    const balances = await circle.getWalletTokenBalance({ id: process.env.CLIENT_WALLET_ID! });
    const usdcBalance = balances.data?.tokenBalances?.find((b: any) => b.token?.symbol === "USDC");
    const balance = parseFloat(usdcBalance?.amount || "0");

    if (balance < 2) {
      return NextResponse.json({ 
        success: false, 
        error: "faucet_empty",
        message: "Our faucet is empty. Please use Circle Faucet instead."
      }, { status: 503 });
    }

    const tx = await circle.createTransaction({
      walletId: process.env.CLIENT_WALLET_ID!,
      blockchain: "ARC-TESTNET",
      destinationAddress: address,
      amounts: ["1"],
      tokenId: "15dc2b5d-0994-58b0-bf8c-3a0501148ee8",
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });

    const txId = tx.data!.id!;
    let txHash = "";

    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const { data } = await circle.getTransaction({ id: txId });
      if (data?.transaction?.state === "COMPLETE") {
        txHash = data.transaction.txHash!;
        break;
      }
      if (data?.transaction?.state === "FAILED") {
        throw new Error("Transaction failed");
      }
    }

    return NextResponse.json({ 
      success: true, 
      txHash,
      message: "1 USDC sent to your wallet!"
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
