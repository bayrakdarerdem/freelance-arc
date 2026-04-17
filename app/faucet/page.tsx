"use client";

import { useState } from "react";

export default function FaucetPage() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null as any);

  async function handleRequest() {
    if (!address.startsWith("0x")) {
      setResult({ success: false, error: "Please enter a valid wallet address starting with 0x" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
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
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900">Browse Jobs</a>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🚰</div>
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Testnet Faucet</h1>
          <p className="text-sm text-gray-500">Get free test USDC on Arc Testnet to try FreelanceArc.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-emerald-800 font-medium">FreelanceArc Faucet</p>
            <p className="text-xs text-emerald-700 mt-1">We send 1 USDC directly from our wallet. Free, instant, no signup.</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Arc Testnet Wallet Address</label>
            <input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {result?.success && explorerUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-emerald-800 font-medium">1 USDC sent!</p>
              <a href={explorerUrl} target="_blank" className="text-xs text-emerald-600 hover:underline">
                View on Arc Explorer
              </a>
            </div>
          )}

          {result && !result.success && result.error !== "faucet_empty" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-800">{result.error}</p>
            </div>
          )}

          {result?.error === "faucet_empty" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-amber-800 font-medium">Our faucet is empty right now.</p>
              <p className="text-xs text-amber-700 mt-1">Use Circle Faucet to get test USDC directly.</p>
              <a href="https://faucet.circle.com" target="_blank" className="text-xs text-amber-600 hover:underline mt-1 inline-block">
                Go to Circle Faucet
              </a>
            </div>
          )}

          <button
            onClick={handleRequest}
            disabled={loading || !address}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50 mb-3"
          >
            {loading ? "Sending..." : "Request 1 USDC"}
          </button>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-400 text-center mb-2">Or get USDC directly from Circle:</p>
            <a href="https://faucet.circle.com" target="_blank" className="w-full border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium text-center block hover:bg-gray-50">
              Circle Faucet
            </a>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-700 mb-2">How to use FreelanceArc:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-xs text-emerald-600 font-medium w-4">1.</span>
              <p className="text-xs text-gray-500">Get test USDC from this faucet</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-emerald-600 font-medium w-4">2.</span>
              <p className="text-xs text-gray-500">Post a job — USDC locks in escrow automatically</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-xs text-emerald-600 font-medium w-4">3.</span>
              <p className="text-xs text-gray-500">Freelancer delivers — payment releases on-chain</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
