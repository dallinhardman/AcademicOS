"use client";

import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";

export default function DashboardPage() {
  const { state, getDueScheduleItems, getUpcomingScheduleItems } = useAcademic();
  const dueItems = getDueScheduleItems();
  const upcomingItems = getUpcomingScheduleItems();

  const stats = [
    { label: "Semesters", value: String(state.semesters.length), sub: `${state.units.length} units total` },
    { label: "Study Guides", value: String(state.summaries.length), sub: `from ${state.contents.length} sources` },
    { label: "Quizzes Taken", value: String(state.quizAttempts.length), sub: `${state.quizzes.length} available` },
    { label: "Reviews Due", value: String(dueItems.length), sub: `${upcomingItems.length} upcoming` },
  ];

  const avgScore =
    state.quizAttempts.length > 0
      ? Math.round(
          state.quizAttempts.reduce((acc, a) => acc + a.score, 0) / state.quizAttempts.length
        )
      : null;

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome back! Here&apos;s your learning overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-academic-600 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Reviews */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Due for Review</h2>
            <Link href="/schedule" className="text-sm text-academic-600 hover:text-academic-700">
              View schedule
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {dueItems.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">
                No reviews due today. Great job staying on top of things!
              </div>
            ) : (
              dueItems.slice(0, 5).map((item) => (
                <div key={item.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.unitName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Last score: {item.lastScore.toFixed(1)} / 5
                    </p>
                  </div>
                  <Link
                    href={`/quizzes/${item.quizId}`}
                    className="text-xs font-medium text-academic-600 hover:text-academic-700 bg-academic-50 px-3 py-1.5 rounded-lg"
                  >
                    Review Now
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Performance</h2>
          </div>
          <div className="p-6 space-y-4">
            {avgScore !== null ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Average Quiz Score</span>
                    <span className="text-sm font-semibold text-slate-900">{avgScore}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-academic-600 h-2 rounded-full transition-all"
                      style={{ width: `${avgScore}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-600">Content Processed</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {state.contents.filter((c) => c.status === "ready").length}/{state.contents.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${state.contents.length > 0 ? (state.contents.filter((c) => c.status === "ready").length / state.contents.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-sm text-slate-400">
                Take some quizzes to see your performance stats here.
              </div>
            )}
            <div className="pt-2">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Recent Summaries</h3>
              {state.summaries.slice(-3).reverse().map((s) => (
                <Link
                  key={s.id}
                  href={`/summaries/${s.id}`}
                  className="block text-sm text-slate-600 hover:text-academic-700 py-1.5"
                >
                  {s.title}
                </Link>
              ))}
              {state.summaries.length === 0 && (
                <p className="text-sm text-slate-400">No summaries yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
