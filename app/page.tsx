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
        if (data.success) setJobs(data.jobs);
        setLoading(false);
      });
  }, []);

  const statusBadge = (status: string) => {
    if (status === "open") return <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full">Open</span>;
    if (status === "funded") return <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">Funded</span>;
    return <span className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded-full">Completed</span>;
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} minutes ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hours ago`;
    return `${Math.floor(hrs / 24)} days ago`;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-medium">
          Freelance<span className="text-emerald-600">Arc</span>
        </span>
        <div className="flex gap-3 items-center">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Dashboard</a>
          <a href="/post-job" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Post a Job</a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-6">Open Jobs</h1>

        {loading && (
          <div className="text-center py-12 text-gray-400 text-sm">Loading jobs from blockchain...</div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-4">No jobs yet.</p>
            <a href="/post-job" className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium">Post the first job</a>
          </div>
        )}

        <div className="space-y-4">
          {jobs.map(job => (
            <a key={job.id} href={`/jobs/${job.job_id_onchain}`} className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h2 className="font-medium text-gray-900">{job.title}</h2>
                {statusBadge(job.status)}
              </div>
              <p className="text-sm text-gray-500 mb-3">{job.description}</p>
              {job.skills && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {job.skills.split(",").map(s => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{s.trim()}</span>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-emerald-600">{job.budget} USDC</span>
                <span className="text-xs text-gray-400">{timeAgo(job.created_at)}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
