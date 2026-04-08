import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="text-lg font-medium">
          Freelance<span className="text-emerald-600">Arc</span>
        </span>
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          Browse Jobs
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-medium text-gray-900 mb-6">My Dashboard</h1>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-medium text-emerald-600">1,240</div>
            <div className="text-sm text-gray-500 mt-1">USDC Earned</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-medium text-gray-900">8</div>
            <div className="text-sm text-gray-500 mt-1">Jobs Completed</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl font-medium text-gray-900">94</div>
            <div className="text-sm text-gray-500 mt-1">Reputation Score</div>
          </div>
        </div>

        <h2 className="text-lg font-medium text-gray-900 mb-4">Active Job</h2>
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="font-medium text-gray-900">React Dashboard Development</div>
              <div className="text-sm text-gray-500 mt-1">500 USDC locked in escrow</div>
            </div>
            <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">Funded</span>
          </div>
          <div className="bg-gray-100 rounded-full h-2 mb-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "60%" }}></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">60% complete</span>
            <span className="text-xs text-gray-500">5 days left</span>
          </div>
          <button className="mt-4 w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium">
            Submit Deliverable
          </button>
        </div>

        <h2 className="text-lg font-medium text-gray-900 mb-4">Completed Jobs</h2>
        <div className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">Mobile UI Design</div>
              <div className="text-xs text-gray-500 mt-0.5">Completed 3 days ago</div>
            </div>
            <div className="text-sm font-medium text-emerald-600">+300 USDC</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">Python Data Analysis Script</div>
              <div className="text-xs text-gray-500 mt-0.5">Completed 1 week ago</div>
            </div>
            <div className="text-sm font-medium text-emerald-600">+150 USDC</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">API Integration</div>
              <div className="text-xs text-gray-500 mt-0.5">Completed 2 weeks ago</div>
            </div>
            <div className="text-sm font-medium text-emerald-600">+790 USDC</div>
          </div>
        </div>
      </div>
    </main>
  );
}