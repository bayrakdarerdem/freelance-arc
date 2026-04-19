"use client";

import { useEffect, useState } from "react";

interface Job {
  id: number;
  title: string;
  description: string;
  budget: number;
  duration: string;
  skills: string;
  status: string;
  job_id_onchain: string;
  created_at: string;
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then(r => r.json())
      .then(data => {
        if (data.success) setJobs(data.jobs.filter((j: any) => j.status !== "completed"));
        setLoading(false);
      });
  }, []);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + " minutes ago";
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + " hours ago";
    return Math.floor(hrs / 24) + " days ago";
  };

  const statusBadge = (status: string) => {
    if (status === "open") return <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">Open</span>;
    if (status === "submitted") return <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">Submitted</span>;
    return <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full font-medium">Funded</span>;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-semibold tracking-tight">
            Freelance<span className="text-emerald-500">Arc</span>
          </a>
          <div className="flex items-center gap-6">
            <a href="/agent-demo" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Agent Demo</a>
            <a href="/faucet" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Faucet</a>
            <a href="/wallet" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Wallet</a>
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Dashboard</a>
            <a href="/post-job" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Post a Job
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            Built on Arc Network — ERC-8183 Agentic Commerce
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            The Future of Work is On-Chain
          </h1>
          <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto leading-relaxed">
            Every job is a smart contract. Every payment is USDC locked in escrow. No platform fees. No middleman. No trust required.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/post-job" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors">
              Post a Job
            </a>
            <a href="/agent-demo" className="border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium transition-colors">
              Watch Agent Demo
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{jobs.length}+</div>
              <div className="text-xs text-gray-500 mt-1">Active Jobs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">~0.006</div>
              <div className="text-xs text-gray-500 mt-1">USDC per transaction</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">0%</div>
              <div className="text-xs text-gray-500 mt-1">Platform fee</div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Open Jobs</h2>
          <span className="text-sm text-gray-400">{jobs.length} jobs available</span>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-sm">Loading jobs from blockchain...</div>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-4">🌱</div>
            <p className="text-gray-500 text-sm mb-4">No jobs yet. Be the first to post one.</p>
            <a href="/post-job" className="bg-emerald-500 text-white px-6 py-2 rounded-lg text-sm font-medium">Post a Job</a>
          </div>
        )}

        <div className="grid gap-4">
          {jobs.map(job => (
            <a key={job.id} href={"/jobs/" + job.job_id_onchain} className="block bg-white border border-gray-100 rounded-2xl p-6 hover:border-emerald-200 hover:shadow-sm transition-all group">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                {statusBadge(job.status)}
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{job.description}</p>
              {job.skills && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {job.skills.split(",").map(s => (
                    <span key={s} className="text-xs bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-full">{s.trim()}</span>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-emerald-600">{job.budget} USDC</span>
                <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <span className="text-sm font-medium">Freelance<span className="text-emerald-500">Arc</span></span>
          <div className="flex gap-6">
            <a href="https://github.com/bayrakdarerdem/freelance-arc" target="_blank" className="text-xs text-gray-400 hover:text-gray-600">GitHub</a>
            <a href="https://testnet.arcscan.app" target="_blank" className="text-xs text-gray-400 hover:text-gray-600">ArcScan</a>
            <a href="/agent-demo" className="text-xs text-gray-400 hover:text-gray-600">Agent Demo</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
