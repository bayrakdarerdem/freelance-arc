import { NextRequest, NextResponse } from "next/server";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { createPublicClient, http } from "viem";
import { arcTestnet } from "viem/chains";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

function getCircle() {
  return initiateDeveloperControlledWalletsClient({
    apiKey: process.env.CIRCLE_API_KEY!,
    entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
  });
}

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

const AGENTIC_COMMERCE = "0x0747EEf0706327138c69792bF28Cd525089e4583";
const USDC = "0x3600000000000000000000000000000000000000";

async function waitForTx(circle: any, txId: string): Promise<string> {
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const { data } = await circle.getTransaction({ id: txId });
    if (data?.transaction?.state === "COMPLETE") return data.transaction.txHash!;
    if (data?.transaction?.state === "FAILED") throw new Error("Transaction failed");
  }
  throw new Error("Transaction timeout");
}

async function getJobIdFromHash(txHash: string): Promise<string> {
  const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
  for (const log of receipt.logs) {
    const topics = (log as any).topics;
    if (topics && topics.length >= 2) {
      return BigInt(topics[1]).toString();
    }
  }
  return "0";
}

export async function POST(req: NextRequest) {
  try {
    const circle = getCircle();
    const supabase = getSupabase();
    const { title, description, budget, duration, skills } = await req.json();
    const clientAddress = process.env.CLIENT_WALLET_ADDRESS!;
    const freelancerAddress = process.env.FREELANCER_WALLET_ADDRESS!;
    const budgetInUnits = (Number(budget) * 1_000_000).toString();
    const block = await publicClient.getBlock();
    const expiredAt = (block.timestamp + BigInt(3600)).toString();

    const createTx = await circle.createContractExecutionTransaction({
      walletAddress: clientAddress, blockchain: "ARC-TESTNET",
      contractAddress: AGENTIC_COMMERCE,
      abiFunctionSignature: "createJob(address,address,uint256,string,address)",
      abiParameters: [freelancerAddress, clientAddress, expiredAt, `${title} | ${description}`, "0x0000000000000000000000000000000000000000"],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    const createHash = await waitForTx(circle, createTx.data!.id!);
    const jobId = await getJobIdFromHash(createHash);

    const budgetTx = await circle.createContractExecutionTransaction({
      walletAddress: freelancerAddress, blockchain: "ARC-TESTNET",
      contractAddress: AGENTIC_COMMERCE,
      abiFunctionSignature: "setBudget(uint256,uint256,bytes)",
      abiParameters: [jobId, budgetInUnits, "0x"],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    await waitForTx(circle, budgetTx.data!.id!);

    const approveTx = await circle.createContractExecutionTransaction({
      walletAddress: clientAddress, blockchain: "ARC-TESTNET",
      contractAddress: USDC,
      abiFunctionSignature: "approve(address,uint256)",
      abiParameters: [AGENTIC_COMMERCE, budgetInUnits],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    await waitForTx(circle, approveTx.data!.id!);

    const fundTx = await circle.createContractExecutionTransaction({
      walletAddress: clientAddress, blockchain: "ARC-TESTNET",
      contractAddress: AGENTIC_COMMERCE,
      abiFunctionSignature: "fund(uint256,bytes)",
      abiParameters: [jobId, "0x"],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    await waitForTx(circle, fundTx.data!.id!);

    await supabase.from("jobs").insert({
      title, description, budget: Number(budget), duration, skills,
      status: "open", job_id_onchain: jobId, tx_hash: createHash,
    });

    return NextResponse.json({
      success: true, jobId, txHash: createHash,
      explorer: `https://testnet.arcscan.app/tx/${createHash}`,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("jobs").select("*").order("created_at", { ascending: false });
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, jobs: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
