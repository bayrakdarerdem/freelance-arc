"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function JobDetail() {
  const params = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [deliverable, setDeliverable] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("jobs")
      .select("*")
      .eq("job_id_onchain", params.id)
      .single()
      .then(({ data }) => {
        setJob(data);
        setLoading(false);
      });
  }, [params.id]);

  async function handleApply() {
    if (!walletAddress.startsWith("0x")) { setError("Invalid wallet address"); return; }
    if (!coverLetter.trim()) { setError("Please write a cover letter"); return; }
    setApplying(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.job_id_onchain, job_title: job.title, wallet_address: walletAddress, cover_letter: coverLetter }),
      });
      const data = await res.json();
      if (data.success) { setApplied(true); setShowModal(false); }
      else setError(data.error);
    } catch (err: any) { setError(err.message); }
    setApplying(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/jobs/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.job_id_onchain, deliverable }),
      });
      const data = await res.json();
      if (data.success) {
        setTxHash(data.txHash);
        setJob({ ...job, status: "submitted" });
      } else setError(data.error);
    } catch (err: any) { setError(err.message); }
    setSubmitting(false);
  }

  async function handleComplete() {
    setCompleting(true);
    setError("");
    try {
      const res = await fetch("/api/jobs/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: job.job_id_onchain }),
      });
      const data = await res.json();
      if (data.success) {
        setTxHash(data.txHash);
        setJob({ ...job, status: "completed" });
      } else setError(data.error);
    } catch (err: any) { setError(err.message); }
    setCompleting(false);
  }

  if (loading) return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Loading...</p></main>;
  if (!job) return <main className="min-h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-400 text-sm">Job not found.</p></main>;

  const skills = job.skills ? job.skills.split(",") : [];

  const statusStep = (status: string) => {
    if (status === "open") return 2;
    if (status === "submitted") return 3;
    if (status === "completed") return 4;
    return 2;
  };

  const step = statusStep(job.status);
  const explorerUrl = job.tx_hash ? "https://testnet.arcscan.app/tx/" + job.tx_hash : null;
  const completeTxUrl = txHash ? "https://testnet.arcscan.app/tx/" + txHash : null;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-medium">Freelance<span className="text-emerald-600">Arc</span></span>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900">Back to jobs</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-xl font-medium text-gray-900">{job.title}</h1>
            <span className={"text-xs px-2 py-1 rounded-full capitalize " + (job.status === "completed" ? "bg-green-50 text-green-800" : job.status === "submitted" ? "bg-blue-50 text-blue-800" : "bg-emerald-50 text-emerald-800")}>{job.status}</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">{job.description}</p>
          {skills.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {skills.map((s: string) => (
                <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{s.trim()}</span>
              ))}
            </div>
          )}
          {job.duration && <p className="text-xs text-gray-400 mb-3">Duration: {job.duration}</p>}
          <div className="text-lg font-medium text-emerald-600">{job.budget} USDC</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Blockchain Job Status</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">✓</div>
              <div>
                <div className="text-sm font-medium text-gray-900">Job created</div>
                <div className="text-xs text-gray-500">createJob() — on-chain #{job.job_id_onchain}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">✓</div>
              <div>
                <div className="text-sm font-medium text-gray-900">{job.budget} USDC locked</div>
                <div className="text-xs text-gray-500">fund() — escrowed</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={"w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 " + (step >= 3 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500")}>
                {step >= 3 ? "✓" : "3"}
              </div>
              <div>
                <div className={"text-sm font-medium " + (step >= 3 ? "text-gray-900" : "text-gray-400")}>Work delivered</div>
                <div className={"text-xs " + (step >= 3 ? "text-gray-500" : "text-gray-400")}>submit() — {step >= 3 ? "on-chain" : "pending"}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className={"w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 " + (step >= 4 ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500")}>
                {step >= 4 ? "✓" : "4"}
              </div>
              <div>
                <div className={"text-sm font-medium " + (step >= 4 ? "text-gray-900" : "text-gray-400")}>Payment released</div>
                <div className={"text-xs " + (step >= 4 ? "text-gray-500" : "text-gray-400")}>complete() — {step >= 4 ? "paid" : "auto payment"}</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-red-800">{error}</p>
          </div>
        )}

        {completeTxUrl && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 text-center">
            <p className="text-xs text-emerald-800 font-medium">Transaction confirmed!</p>
            <a href={completeTxUrl} target="_blank" className="text-xs text-emerald-600 hover:underline">View on Arc Explorer</a>
          </div>
        )}

        {applied && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-sm font-medium text-emerald-800">Application submitted!</p>
            <p className="text-xs text-emerald-600 mt-1">The client will review your application.</p>
          </div>
        )}

        {job.status === "completed" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 text-center">
            <p className="text-sm font-medium text-emerald-800">Job completed!</p>
            <p className="text-xs text-emerald-600 mt-1">{job.budget} USDC has been released to the freelancer.</p>
          </div>
        )}

        <div className="flex gap-3">
          {job.status === "open" && (
            <>
              <button onClick={() => setShowModal(true)} disabled={applied} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
                {applied ? "Applied" : "Apply for this job"}
              </button>
              <button
                onClick={() => { setShowModal(false); handleSubmit(); }}
                disabled={submitting}
                className="flex-1 border border-emerald-600 text-emerald-600 py-3 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Deliverable"}
              </button>
            </>
          )}
          {job.status === "submitted" && (
            <button onClick={handleComplete} disabled={completing} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium disabled:opacity-50">
              {completing ? "Processing..." : "Approve & Pay"}
            </button>
          )}
          {job.status === "completed" && (
            <div className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl text-sm font-medium text-center">
              Completed
            </div>
          )}
          {explorerUrl && (
            <a href={explorerUrl} target="_blank" className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium text-center">
              View on Explorer
            </a>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-medium text-gray-900 mb-1">Apply for this job</h2>
            <p className="text-xs text-gray-500 mb-4">{job.title}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Wallet Address</label>
              <input type="text" placeholder="0x..." value={walletAddress} onChange={e => setWalletAddress(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
              <textarea placeholder="Why are you the best person for this job?" value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-xs text-red-800">{error}</p></div>}
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setError(""); }} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleApply} disabled={applying} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium disabled:opacity-50">{applying ? "Submitting..." : "Submit Application"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
