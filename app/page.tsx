export default function Home() {
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
        <div className="space-y-4">
          <a href="/jobs/1" className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-medium text-gray-900">React Dashboard Development</h2>
              <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-1 rounded-full">Open</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">3 weeks, remote, customer analytics panel</p>
            <div className="flex gap-2 mb-3">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">React</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">TypeScript</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Tailwind</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-emerald-600">500 USDC</span>
              <span className="text-xs text-gray-400">3 hours ago</span>
            </div>
          </a>
          <a href="/jobs/2" className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-medium text-gray-900">Mobile UI Design</h2>
              <span className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full">Funded</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">12 screens for iOS/Android</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-emerald-600">300 USDC</span>
              <span className="text-xs text-gray-400">1 day ago</span>
            </div>
          </a>
          <a href="/jobs/3" className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-emerald-300 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-medium text-gray-900">Python Data Analysis Script</h2>
              <span className="text-xs bg-green-50 text-green-800 px-2 py-1 rounded-full">Completed</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">Automated report generation from CSV data</p>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-emerald-600">150 USDC</span>
              <span className="text-xs text-gray-400">3 days ago</span>
            </div>
          </a>
        </div>
      </div>
    </main>
  );
}
