import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode("data: " + JSON.stringify(data) + "\n\n"));
      }

      try {
        const { default: Anthropic } = await import("@anthropic-ai/sdk");
        const { initiateDeveloperControlledWalletsClient } = await import("@circle-fin/developer-controlled-wallets");
        const { createPublicClient, http, keccak256, toHex } = await import("viem");
        const { arcTestnet } = await import("viem/chains");

        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        const circle = initiateDeveloperControlledWalletsClient({
          apiKey: process.env.CIRCLE_API_KEY!,
          entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
        });
        const publicClient = createPublicClient({ chain: arcTestnet, transport: http() });
        const AGENTIC_COMMERCE = "0x0747EEf0706327138c69792bF28Cd525089e4583";
        const USDC = "0x3600000000000000000000000000000000000000";
        const clientAddress = process.env.CLIENT_WALLET_ADDRESS!;
        const freelancerAddress = process.env.FREELANCER_WALLET_ADDRESS!;

        async function waitForTx(txId: string): Promise<string> {
          for (let i = 0; i < 40; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const { data } = await circle.getTransaction({ id: txId });
            if (data?.transaction?.state === "COMPLETE") return data.transaction.txHash!;
            if (data?.transaction?.state === "FAILED") throw new Error("Transaction failed");
          }
          throw new Error("Timeout");
        }

        send({ phase: 1, agent: "A", message: "Deciding what job to post..." });
        const r1 = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514", max_tokens: 200,
          messages: [{ role: "user", content: "You are an autonomous AI client agent on FreelanceArc blockchain marketplace. Post a SHORT writing job. Examples: write taglines, write a product description. Budget: 1-2 USDC only. JSON only: {\"title\": \"job title\", \"description\": \"what to write\", \"budget\": 2}" }]
        });
        const jobText = (r1.content[0] as any).text.trim();
        let job = { title: "Write 3 taglines for a coffee brand", description: "Write 3 short catchy taglines for a premium coffee brand", budget: 1 };
        try { job = JSON.parse(jobText); } catch {}
        send({ phase: 1, agent: "A", message: "I will post: \"" + job.title + "\" for " + job.budget + " USDC" });

        send({ phase: 2, agent: "B", message: "Reviewing the job posting..." });
        const r2 = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514", max_tokens: 100,
          messages: [{ role: "user", content: "You are an autonomous AI freelancer. Job: " + job.title + " — " + job.description + ". Can you complete this? Reply YES or NO and one sentence." }]
        });
        const b1 = (r2.content[0] as any).text;
        send({ phase: 2, agent: "B", message: b1 });

        if (!b1.toUpperCase().includes("YES")) {
          send({ phase: 0, agent: "rejected", message: "Agent B declined. Demo ended." });
          controller.close();
          return;
        }

        send({ phase: 3, agent: "system", message: "Posting job on Arc blockchain..." });
        const block = await publicClient.getBlock();
        const expiredAt = (block.timestamp + 3600n).toString();
        const budgetInUnits = (job.budget * 1_000_000).toString();

        const createTx = await circle.createContractExecutionTransaction({
          walletAddress: clientAddress, blockchain: "ARC-TESTNET",
          contractAddress: AGENTIC_COMMERCE,
          abiFunctionSignature: "createJob(address,address,uint256,string,address)",
          abiParameters: [freelancerAddress, clientAddress, expiredAt, "[AI Agent] " + job.title, "0x0000000000000000000000000000000000000000"],
          fee: { type: "level", config: { feeLevel: "MEDIUM" } },
        });
        const createHash = await waitForTx(createTx.data!.id!);
        send({ phase: 3, agent: "system", message: "createJob() confirmed on-chain", tx: createHash });

        const receipt = await publicClient.getTransactionReceipt({ hash: createHash as any });
        let jobId = "0";
        for (const log of receipt.logs) {
          const topics = (log as any).topics;
          if (topics && topics.length >= 2) { jobId = BigInt(topics[1]).toString(); break; }
        }
        send({ phase: 3, agent: "system", message: "Job ID: " + jobId + " created on-chain" });

        const budgetTx = await circle.createContractExecutionTransaction({
          walletAddress: freelancerAddress, blockchain: "ARC-TESTNET",
          contractAddress: AGENTIC_COMMERCE,
          abiFunctionSignature: "setBudget(uint256,uint256,bytes)",
          abiParameters: [jobId, budgetInUnits, "0x"],
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
          abiParameters: [jobId, "0x"],
          fee: { type: "level", config: { feeLevel: "MEDIUM" } },
        });
        const fundHash = await waitForTx(fundTx.data!.id!);
        send({ phase: 3, agent: "system", message: job.budget + " USDC locked in escrow", tx: fundHash });

        send({ phase: 4, agent: "B", message: "Working on the job..." });
        const r3 = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514", max_tokens: 500,
          messages: [{ role: "user", content: "You are an autonomous AI freelancer. Complete: " + job.title + " — " + job.description + ". Be concise and professional." }]
        });
        const deliverable = (r3.content[0] as any).text;
        send({ phase: 4, agent: "B", message: deliverable });

        const deliverableHash = keccak256(toHex(deliverable));
        const submitTx = await circle.createContractExecutionTransaction({
          walletAddress: freelancerAddress, blockchain: "ARC-TESTNET",
          contractAddress: AGENTIC_COMMERCE,
          abiFunctionSignature: "submit(uint256,bytes32,bytes)",
          abiParameters: [jobId, deliverableHash, "0x"],
          fee: { type: "level", config: { feeLevel: "MEDIUM" } },
        });
        const submitHash = await waitForTx(submitTx.data!.id!);
        send({ phase: 4, agent: "system", message: "Deliverable submitted on-chain", tx: submitHash });

        send({ phase: 5, agent: "A", message: "Evaluating the deliverable..." });
        const r4 = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514", max_tokens: 150,
          messages: [{ role: "user", content: "You are an autonomous AI client. Job: \"" + job.title + "\". Deliverable: " + deliverable.slice(0, 600) + ". If there is genuine effort, APPROVE. Reply APPROVE or REJECT and one sentence." }]
        });
        const evaluation = (r4.content[0] as any).text;
        send({ phase: 5, agent: "A", message: evaluation });

        if (evaluation.toUpperCase().includes("APPROVE")) {
          const reasonHash = keccak256(toHex("Approved by AI evaluator"));
          const completeTx = await circle.createContractExecutionTransaction({
            walletAddress: clientAddress, blockchain: "ARC-TESTNET",
            contractAddress: AGENTIC_COMMERCE,
            abiFunctionSignature: "complete(uint256,bytes32,bytes)",
            abiParameters: [jobId, reasonHash, "0x"],
            fee: { type: "level", config: { feeLevel: "MEDIUM" } },
          });
          const completeHash = await waitForTx(completeTx.data!.id!);
          send({ phase: 5, agent: "system", message: job.budget + " USDC transferred to Agent B!", tx: completeHash });
          send({ phase: 0, agent: "complete", message: "Job #" + jobId + " completed. " + job.budget + " USDC paid. No humans involved.", jobId });
        } else {
          send({ phase: 0, agent: "rejected", message: "Work rejected. USDC remains in escrow." });
        }

      } catch (err: any) {
        send({ phase: 0, agent: "error", message: err.message });
      }

      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
