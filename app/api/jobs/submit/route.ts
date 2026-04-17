import { NextRequest, NextResponse } from "next/server";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { createPublicClient, http, keccak256, toHex } from "viem";
import { arcTestnet } from "viem/chains";
import { createClient } from "@supabase/supabase-js";

const AGENTIC_COMMERCE = "0x0747EEf0706327138c69792bF28Cd525089e4583";

export async function POST(req: NextRequest) {
  try {
    const { job_id, deliverable } = await req.json();

    const circle = initiateDeveloperControlledWalletsClient({
      apiKey: process.env.CIRCLE_API_KEY!,
      entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
    });

    const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
    const deliverableHash = keccak256(toHex(deliverable || "Deliverable submitted"));

    const tx = await circle.createContractExecutionTransaction({
      walletAddress: process.env.FREELANCER_WALLET_ADDRESS!,
      blockchain: "ARC-TESTNET",
      contractAddress: AGENTIC_COMMERCE,
      abiFunctionSignature: "submit(uint256,bytes32,bytes)",
      abiParameters: [job_id, deliverableHash, "0x"],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });

    const txId = tx.data!.id!;
    let txHash = "";

    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 2000));
      const { data } = await circle.getTransaction({ id: txId });
      if (data?.transaction?.state === "COMPLETE") {
        txHash = data.transaction.txHash!;
        break;
      }
      if (data?.transaction?.state === "FAILED") throw new Error("Transaction failed");
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.from("jobs").update({ status: "submitted" }).eq("job_id_onchain", job_id);

    return NextResponse.json({ success: true, txHash });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
