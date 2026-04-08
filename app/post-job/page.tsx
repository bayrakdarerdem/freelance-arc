"use client";

import { useState } from "react";

export default function PostJob() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    duration: "",
    skills: "",
  });

  async function handleSubmit() {
    if (!form.title || !form.description || !form.budget) {
      alert("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Something went wrong.");
    }
    setLoading(false);
  }

  if (result) {
    return (
      <main className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <span className="text-lg font-medium">Freelance<span className="text-emerald-600">Arc</span></span>
        </nav>
        <div className="max-w-xl mx-auto px-6 py-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-emerald-600 text-xl">✓</span>
            </div>
            <h1 className="text-xl font-medium text-gray-900 mb-2">Job Posted!</h1>
            <p className="text-sm text-gray-500 mb-4">Your job is live on Arc blockchain. USDC is locked in escrow.</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-left">
              <div className="text-xs text-gray-500 mb-1">Job ID</div>
              <div className="text-sm font-medium text-gray-900">#{result.jobId}</div>
            </div>
            <a href={result.explorer} target="_blank" className="block w-full border border-gray-200 text-gray-700 py-2 rounded-lg text-sm mb-3">
              View on Arc Explorer
            </a>
            <a href="/" className="block w-full bg-emerald-600 text-white py-2 rounded-lg text-sm">
              Back to Jobs
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-medium">Freelance<span className="text-emerald-600">Arc</span></span>
        <a href="/" className="text-sm text-gray-500">Back to jobs</a>
      </nav>
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-6">Post a Job</h1>
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input type="text" placeholder="e.g. React Dashboard Development" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea placeholder="Describe the job in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget (USDC) *</label>
            <input type="number" placeholder="e.g. 500" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input type="text" placeholder="e.g. 3 weeks" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
            <input type="text" placeholder="e.g. React, TypeScript, Tailwind" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs text-emerald-800">When you post this job, your USDC will be locked in escrow on Arc blockchain. Payment is released automatically when work is approved.</p>
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
            {loading ? "Creating job on blockchain... (this takes ~1 min)" : "Post Job & Lock USDC"}
          </button>
        </div>
      </div>
    </main>
  );
}
