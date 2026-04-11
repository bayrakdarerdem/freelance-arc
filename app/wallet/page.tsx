"use client";

import { useState } from "react";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { AppKit } from "@circle-fin/app-kit";
import { ViemV2Adapter } from "@circle-fin/adapter-viem-v2";

const arcTestnet = {
  id: 923018,
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.arc.dev"] } },
};

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"bridge" | "swap" | "send">("bridge");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [bridgeAmount, setBridgeAmount] = useState("1.00");
  const [swapAmount, setSwapAmount] = useState("1.00");
  const [swapDirection, setSwapDirection] = useState<"USDC_TO_EURC" | "EURC_TO_USDC">("USDC_TO_EURC");
  const [sendAmount, setSendAmount] = useState("1.00");
  const [sendTo, setSendTo] = useState("");

  async function handleAction() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/wallet/" + activeTab, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: activeTab === "bridge" ? bridgeAmount : activeTab === "swap" ? swapAmount : sendAmount,
          direction: swapDirection,
          to: sendTo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.txHash || data.message || "Success!");
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-medium">Freelance<span className="text-emerald-600">Arc</span></span>
        <a href="/" className="text-sm text-gray-500">Browse Jobs</a>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Wallet</h1>
        <p className="text-sm text-gray-500 mb-6">Bridge, swap, and send USDC powered by Arc App Kit.</p>

        <div className="flex gap-2 mb-6">
          {(["bridge", "swap", "send"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setResult(null); setError(null); }}
              className={"flex-1 py-2 rounded-lg text-sm font-medium border transition-colors " + (activeTab === tab ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          {activeTab === "bridge" && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">Transfer USDC from Ethereum Sepolia to Arc Testnet using Circle CCTP.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USDC)</label>
                <input type="number" value={bridgeAmount} onChange={e => setBridgeAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>From: Ethereum Sepolia</span>
                <span>To: Arc Testnet</span>
              </div>
            </>
          )}

          {activeTab === "swap" && (
            <>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-xs text-purple-800">Exchange USDC for EURC (or vice versa) on Arc Testnet.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Direction</label>
                <select value={swapDirection} onChange={e => setSwapDirection(e.target.value as any)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="USDC_TO_EURC">USDC → EURC</option>
                  <option value="EURC_TO_USDC">EURC → USDC</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" value={swapAmount} onChange={e => setSwapAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </>
          )}

          {activeTab === "send" && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">Send USDC to any wallet address on Arc Testnet.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
                <input type="text" placeholder="0x..." value={sendTo} onChange={e => setSendTo(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USDC)</label>
                <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </>
          )}

          {result && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-xs text-emerald-800 font-medium">Success!</p>
              {result.startsWith("0x") ? (
                <a href={"https://testnet.arcscan.app/tx/" + result} target="_blank" className="text-xs text-emerald-600 hover:underline">View on Arc Explorer</a>
              ) : (
                <p className="text-xs text-emerald-700">{result}</p>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleAction}
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Processing..." : activeTab === "bridge" ? "Bridge USDC" : activeTab === "swap" ? "Swap Tokens" : "Send USDC"}
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          Powered by Arc App Kit + Circle CCTP
        </div>
      </div>
    </main>
  );
}
