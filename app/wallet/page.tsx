"use client";

import { useState } from "react";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("send" as "bridge" | "swap" | "send");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null as any);
  const [sendAmount, setSendAmount] = useState("1");
  const [sendTo, setSendTo] = useState("");

  async function handleSend() {
    if (!sendTo.startsWith("0x")) {
      setResult({ success: false, error: "Invalid recipient address" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/wallet/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: sendAmount, to: sendTo }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    }
    setLoading(false);
  }

  const explorerUrl = result?.txHash ? "https://testnet.arcscan.app/tx/" + result.txHash : null;

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
              onClick={() => { setActiveTab(tab); setResult(null); }}
              className={"flex-1 py-2 rounded-lg text-sm font-medium border transition-colors " + (activeTab === tab ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-600 border-gray-200")}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">

          {activeTab === "bridge" && (
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-800 font-medium">Bridge - Coming Soon</p>
                <p className="text-xs text-blue-700 mt-1">Cross-chain USDC bridging via Circle CCTP is being integrated. Use Circle Faucet to get testnet USDC in the meantime.</p>
              </div>
              <a href="https://faucet.circle.com" target="_blank" className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium text-center block hover:bg-gray-50">
                Go to Circle Faucet
              </a>
            </div>
          )}

          {activeTab === "swap" && (
            <div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-purple-800 font-medium">Swap - Coming Soon</p>
                <p className="text-xs text-purple-700 mt-1">USDC and EURC swaps via Arc App Kit are available on mainnet. Testnet support coming soon.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 font-medium">Available on mainnet:</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-gray-500">USDC to EURC</p>
                  <p className="text-xs text-gray-500">EURC to USDC</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "send" && (
            <div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-emerald-800">Send USDC to any wallet address on Arc Testnet.</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={sendTo}
                  onChange={e => setSendTo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USDC)</label>
                <input
                  type="number"
                  value={sendAmount}
                  onChange={e => setSendAmount(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {result?.success && explorerUrl && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-emerald-800 font-medium">USDC sent successfully!</p>
                  <a href={explorerUrl} target="_blank" className="text-xs text-emerald-600 hover:underline">View on Arc Explorer</a>
                </div>
              )}

              {result && !result.success && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-red-800">{result.error}</p>
                </div>
              )}

              <button
                onClick={handleSend}
                disabled={loading || !sendTo}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send USDC"}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-gray-400">
          Powered by Arc App Kit + Circle CCTP
        </div>
      </div>
    </main>
  );
}
