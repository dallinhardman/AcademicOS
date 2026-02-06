export default function DashboardPage() {
  const stats = [
    { label: "Courses Enrolled", value: "4", change: "+1 this semester" },
    { label: "Code Sessions", value: "28", change: "+5 this week" },
    { label: "Problems Solved", value: "142", change: "+12 this week" },
    { label: "Current Streak", value: "7 days", change: "Personal best!" },
  ];

  const recentActivity = [
    { action: "Completed", item: "Binary Search implementation", course: "Data Structures", time: "2 hours ago" },
    { action: "Asked", item: "How does async/await work?", course: "Code Chat", time: "5 hours ago" },
    { action: "Started", item: "Graph Traversal module", course: "Algorithms", time: "1 day ago" },
    { action: "Reviewed", item: "React Hooks deep dive", course: "Web Development", time: "2 days ago" },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here&apos;s your learning progress.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-academic-600 mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {recentActivity.map((activity, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-900">
                  <span className="text-slate-500">{activity.action}</span>{" "}
                  <span className="font-medium">{activity.item}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{activity.course}</p>
              </div>
              <span className="text-xs text-slate-400">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
