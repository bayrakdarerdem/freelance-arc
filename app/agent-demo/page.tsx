"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  phase: number;
  agent: string;
  message: string;
  tx?: string;
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
      const { done: sd, value } = await reader.read();
      if (sd) break;
      const text = decoder.decode(value);
      for (const line of text.split("\n")) {
        if (line.startsWith("data: ")) {
          try {
            const d = JSON.parse(line.slice(6));
            setMessages(p => [...p, d]);
            if (["complete","rejected","error"].includes(d.agent)) setDone(true);
          } catch {}
        }
      }
    }
    setRunning(false);
  }

  const getStyle = (agent: string) => {
    if (agent === "A") return { label: "Agent A", sub: "Client", wrap: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-800" };
    if (agent === "B") return { label: "Agent B", sub: "Freelancer", wrap: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-800" };
    return { label: "Blockchain", sub: "Arc Testnet", wrap: "bg-gray-50 border-gray-200", badge: "bg-gray-100 text-gray-700" };
  };

  const phases = ["Phase 1 — Job Decision","Phase 2 — Job Evaluation","Phase 3 — On-Chain","Phase 4 — Work & Delivery","Phase 5 — Evaluation & Payment"];
  let lastPhase = 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-medium">Freelance<span className="text-emerald-600">Arc</span></span>
        <a href="/" className="text-sm text-gray-500">Browse Jobs</a>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Agent-to-Agent Commerce</h1>
        <p className="text-sm text-gray-500 mb-6">Two AI agents interact autonomously on Arc blockchain. Agent A posts a job and locks USDC. Agent B completes it and gets paid. No humans involved.</p>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-purple-200 rounded-xl p-4">
            <div className="text-xs font-medium text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full inline-block mb-2">Agent A</div>
            <div className="text-sm font-medium">Client Agent</div>
            <div className="text-xs text-gray-500 mt-1">Posts jobs, locks USDC, evaluates work</div>
          </div>
          <div className="bg-white border border-blue-200 rounded-xl p-4">
            <div className="text-xs font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full inline-block mb-2">Agent B</div>
            <div className="text-sm font-medium">Freelancer Agent</div>
            <div className="text-xs text-gray-500 mt-1">Finds jobs, completes work, gets paid</div>
          </div>
        </div>
        {!running && (
          <button onClick={startDemo} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium mb-6">
            {done ? "Run Again" : "Start Agent Demo"}
          </button>
        )}
        {running && (
          <div className="w-full border bg-white py-3 rounded-xl text-sm text-center text-gray-400 mb-6">
            Demo running... (~3-4 minutes)
          </div>
        )}
        <div className="space-y-3">
          {messages.map((msg, i) => {
            const showPhase = msg.phase !== lastPhase && msg.phase > 0;
            if (msg.phase > 0) lastPhase = msg.phase;
            const s = getStyle(msg.agent);
            if (msg.agent === "complete") return (
              <div key={i} className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <div className="text-sm font-medium text-emerald-800 mb-1">{msg.message}</div>
                <div className="text-xs text-emerald-600">No humans involved. Fully autonomous.</div>
              </div>
            );
            if (msg.agent === "rejected") return (
              <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <div className="text-sm font-medium text-red-800">{msg.message}</div>
              </div>
            );
            const explorerUrl = msg.tx ? "https://testnet.arcscan.app/tx/" + msg.tx : null;
            return (
              <div key={i}>
                {showPhase && <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-4 mb-2">{phases[msg.phase - 1]}</div>}
                <div className={"border rounded-xl p-4 " + s.wrap}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={"text-xs font-medium px-2 py-0.5 rounded-full " + s.badge}>{s.label}</span>
                    <span className="text-xs text-gray-400">{s.sub}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                  {explorerUrl && (
                    <a href={explorerUrl} target="_blank" className="text-xs text-emerald-600 mt-2 inline-block hover:underline">
                      View on Arc Explorer
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
