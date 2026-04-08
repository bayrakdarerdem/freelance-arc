export default function JobDetail() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-medium">
          Freelance<span className="text-emerald-600">Arc</span>
        </span>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-900">← Back to jobs</a>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-xl font-medium text-gray-900">React Dashboard Development</h1>
            <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full">Open</span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Build a customer analytics dashboard with charts, filters, and CSV export. 3 weeks, remote.
          </p>
          <div className="flex gap-2 mb-4">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">React</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">TypeScript</span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Tailwind</span>
          </div>
          <div className="text-lg font-medium text-emerald-600">500 USDC</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Blockchain Job Status</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">✓</div>
              <div>
                <div className="text-sm font-medium text-gray-900">Job created</div>
                <div className="text-xs text-gray-500">createJob() — on-chain</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs flex-shrink-0 mt-0.5">✓</div>
              <div>
                <div className="text-sm font-medium text-gray-900">500 USDC locked</div>
                <div className="text-xs text-gray-500">fund() — escrowed</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs flex-shrink-0 mt-0.5">3</div>
              <div>
                <div className="text-sm font-medium text-gray-400">Waiting for delivery</div>
                <div className="text-xs text-gray-400">submit() — pending</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs flex-shrink-0 mt-0.5">4</div>
              <div>
                <div className="text-sm font-medium text-gray-400">Payment release</div>
                <div className="text-xs text-gray-400">complete() — auto payment</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-medium">
            Apply for this job
          </button>
          <button className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-medium">
            View on Explorer
          </button>
        </div>
      </div>
    </main>
  );
}