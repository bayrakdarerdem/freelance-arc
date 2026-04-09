"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  phase: number;
  agent: string;
  message: string;
  tx?: string;
  jobId?: string;
}

export default function AgentDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startDemo() {
    setMessages([]);
    setDone(false);
    setRunning(true);

    const res = await fetch("/api/agent-demo");
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;

      const text = decoder.decode(value);
      const lines = text.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            setMessages(prev => [...prev, data]);
            if (data.agent === "complete" || data.agent === "rejected" || data.agent === "error") {
              setDone(true);
            }
          } catch {}
        }
      }
    }
    setRunning(false);
  }

  const agentLabel = (agent: string) => {
    if (agent === "A") return { label: "Agent A", sub: "Client", color: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-800" };
    if (agent === "B") return { label: "Agent B", sub: "Freelancer", color: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-800" };
    return { label: "Blockchain", sub: "Arc Testnet", color: "bg-gray-50 border-gray-200", badge: "bg-gray-100 text-gray-700" };
  };

  const phaseLabel = (phase: number) => {
    if (phase === 1) return "Phase 1 — Job Decision";
    if (phase === 2) return "Phase 2 — Job Evaluation";
    if (phase === 3) return "Phase 3 — On-Chain";
    if (phase === 4) return "Phase 4 — Work & Delivery";
    if (phase === 5) return "Phase 5 — Evaluation & Payment";
    return "";
  };

  let lastPhase = 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-medium">
          Freelance<span className="text-emerald-600">Arc</span>
        </span>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900">Browse Jobs</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Agent-to-Agent Commerce</h1>
          <p className="text-sm text-gray-500">
            Two AI agents interact autonomously on Arc blockchain. Agent A posts a job and locks USDC in escrow. Agent B finds the job, completes it, and gets paid automatically. No humans involved.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-purple-200 rounded-xl p-4">
            <div className="text-xs font-medium text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full inline-block mb-2">Agent A</div>
            <div className="text-sm font-medium text-gray-900">Client Agent</div>
            <div className="text-xs text-gray-500 mt-1">Posts jobs, locks USDC, evaluates work</div>
          </div>
          <div className="bg-white border border-blue-200 rounded-xl p-4">
            <div className="text-xs font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-2">Agent B</div>
            <div className="text-sm font-medium text-gray-900">Freelancer Agent</div>
            <div className="text-xs text-gray-500 mt-1">Finds jobs, completes work, gets paid</div>
          </div>
        </div>

        {!running && !done && (
          <button
            onClick={startDemo}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium mb-6"
          >
            Start Agent Demo
          </button>
        )}

        {running && !done && (
          <div className="w-full border border-gray-200 bg-white py-3 rounded-xl text-sm text-center text-gray-400 mb-6">
            Demo running... (~3-4 minutes)
          </div>
        )}

        {done && (
          <button
            onClick={startDemo}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium mb-6"
          >
            Run Again
          </button>
        )}

        <div className="space-y-3">
          {messages.map((msg, i) => {
            const showPhase = msg.phase !== lastPhase && msg.phase > 0;
            if (msg.phase > 0) lastPhase = msg.phase;

            const info = agentLabel(msg.agent);

            if (msg.agent === "complete") {
              return (
                <div key={i}>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">🤖 🤖</div>
                    <div className="text-sm font-medium text-emerald-800">{msg.message}</div>
                    <div className="text-xs text-emerald-600 mt-1">No humans involved. Fully autonomous.</div>
                  </div>
                </div>
              );
            }

            if (msg.agent === "rejected") {
              return (
                <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <div className="text-sm font-medium text-red-800">{msg.message}</div>
                </div>
              );
            }

            return (
              <div key={i}>
                {showPhase && (
                  <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-4 mb-2">
                    {phaseLabel(msg.phase)}
                  </div>
                )}
                <div className={`border rounded-xl p-4 ${info.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.badge}`}>
                      {info.label}
                    </span>
                    <span className="text-xs text-gray-400">{info.sub}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                  {msg.tx && (
                    
                      href={`https://testnet.arcscan.app/tx/${msg.tx}`}
                      target="_blank"
                      className="text-xs text-emerald-600 mt-2 inline-block hover:underline"
                    >
                      View on Arc Explorer →
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>
    </main>
  );
}