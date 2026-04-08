import { NextRequest, NextResponse } from "next/server";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";
import { createPublicClient, http, decodeEventLog } from "viem";
import { arcTestnet } from "viem/chains";
import { createClient } from "@supabase/supabase-js";

const circle = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(),
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const AGENTIC_COMMERCE = "0x0747EEf0706327138c69792bF28Cd525089e4583";
const USDC = "0x3600000000000000000000000000000000000000";

const ABI = [
  { name: "createJob", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "provider", type: "address" }, { name: "evaluator", type: "address" }, { name: "expiredAt", type: "uint256" }, { name: "description", type: "string" }, { name: "hook", type: "address" }],
    outputs: [] },
  { name: "setBudget", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }, { name: "amount", type: "uint256" }, { name: "optParams", type: "bytes" }], outputs: [] },
  { name: "fund", type: "function", stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }, { name: "optParams", type: "bytes" }], outputs: [] },
  { name: "JobCreated", type: "event", anonymous: false,
    inputs: [{ indexed: true, name: "jobId", type: "uint256" }, { indexed: true, name: "client", type: "address" }, { indexed: true, name: "provider", type: "address" }, { indexed: false, name: "evaluator", type: "address" }, { indexed: false, name: "expiredAt", type: "uint256" }, { indexed: false, name: "hook", type: "address" }] },
] as const;

async function waitForTx(txId: string): Promise<string> {
  for (let i = 0; i < 40; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const { data } = await circle.getTransaction({ id: txId });
    if (data?.transaction?.state === "COMPLETE") return data.transaction.txHash!;
    if (data?.transaction?.state === "FAILED") throw new Error("Transaction failed");
  }
  throw new Error("Transaction timeout");
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, budget, duration, skills } = await req.json();
    const clientAddress = process.env.CLIENT_WALLET_ADDRESS!;
    const freelancerAddress = process.env.FREELANCER_WALLET_ADDRESS!;
    const budgetInUnits = (Number(budget) * 1_000_000).toString();
    const block = await publicClient.getBlock();
    const expiredAt = (block.timestamp + 3600n).toString();

    const createTx = await circle.createContractExecutionTransaction({
      walletAddress: clientAddress, blockchain: "ARC-TESTNET",
      contractAddress: AGENTIC_COMMERCE,
      abiFunctionSignature: "createJob(address,address,uint256,string,address)",
      abiParameters: [freelancerAddress, clientAddress, expiredAt, `${title} | ${description}`, "0x0000000000000000000000000000000000000000"],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    const createHash = await waitForTx(createTx.data!.id!);

    const receipt = await publicClient.getTransactionReceipt({ hash: createHash as `0x${string}` });
    let jobId = 0n;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({ abi: ABI, data: log.data, topics: log.topics });
        if (decoded.eventName === "JobCreated") { jobId = decoded.args.jobId; break; }
      } catch { continue; }
    }

    const budgetTx = await circle.createContractExecutionTransaction({
      walletAddress: freelancerAddress, blockchain: "ARC-TESTNET",
      contractAddress: AGENTIC_COMMERCE,
      abiFunctionSignature: "setBudget(uint256,uint256,bytes)",
      abiParameters: [jobId.toString(), budgetInUnits, "0x"],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    await waitForTx(budgetTx.data!.id!);

    const approveTx = await circle.createContractExecutionTransaction({
      walletAddress: clientAddress, blockchain: "ARC-TESTNET",
      contractAddress: USDC,
      abiFunctionSignature: "approve(address,uint256)",
      abiParameters: [AGENTIC_COMMERCE, budgetInUnits],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    await waitForTx(approveTx.data!.id!);

    const fundTx = await circle.createContractExecutionTransaction({
      walletAddress: clientAddress, blockchain: "ARC-TESTNET",
      contractAddress: AGENTIC_COMMERCE,
      abiFunctionSignature: "fund(uint256,bytes)",
      abiParameters: [jobId.toString(), "0x"],
      fee: { type: "level", config: { feeLevel: "MEDIUM" } },
    });
    await waitForTx(fundTx.data!.id!);

    await supabase.from("jobs").insert({
      title,
      description,
      budget: Number(budget),
      duration,
      skills,
      status: "open",
      job_id_onchain: jobId.toString(),
      tx_hash: createHash,
    });

    return NextResponse.json({
      success: true,
      jobId: jobId.toString(),
      txHash: createHash,
      explorer: `https://testnet.arcscan.app/tx/${createHash}`,
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, jobs: data });
}
