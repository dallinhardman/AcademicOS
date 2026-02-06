"use client";

import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";
import { getDaysUntilReview } from "@/lib/scheduler";

export default function SchedulePage() {
  const { state, getDueScheduleItems, getUpcomingScheduleItems } = useAcademic();
  const dueItems = getDueScheduleItems();
  const upcomingItems = getUpcomingScheduleItems();

  // Build a 7-day calendar
  const today = new Date();
  const days: { date: Date; label: string; items: typeof dueItems }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayLabel = i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

    const itemsForDay = state.scheduleItems.filter((item) => {
      const reviewDate = new Date(item.nextReviewDate);
      if (i === 0) return reviewDate < dayEnd;
      return reviewDate >= dayStart && reviewDate < dayEnd;
    });

    days.push({ date, label: dayLabel, items: itemsForDay });
  }

  const laterItems = state.scheduleItems.filter((item) => {
    const daysUntil = getDaysUntilReview(item);
    return daysUntil > 7;
  });

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Review Schedule</h1>
        <p className="text-slate-600 mt-1">
          Spaced repetition calendar powered by the SM-2 algorithm. Weak topics are reviewed sooner, strong topics later.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500 mb-1">Due Today</p>
          <p className="text-2xl font-bold text-red-600">{dueItems.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500 mb-1">Upcoming This Week</p>
          <p className="text-2xl font-bold text-orange-600">
            {upcomingItems.filter((i) => getDaysUntilReview(i) <= 7).length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-sm text-slate-500 mb-1">Total Scheduled</p>
          <p className="text-2xl font-bold text-slate-900">{state.scheduleItems.length}</p>
        </div>
      </div>

      {/* 7-Day Calendar */}
      <div className="space-y-3 mb-8">
        {days.map((day, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className={`px-5 py-3 border-b flex items-center justify-between ${
              i === 0 ? "bg-academic-50 border-academic-100" : "bg-slate-50 border-slate-100"
            }`}>
              <h3 className={`text-sm font-semibold ${i === 0 ? "text-academic-800" : "text-slate-700"}`}>
                {day.label}
              </h3>
              <span className="text-xs text-slate-500">
                {day.date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>
            {day.items.length === 0 ? (
              <div className="px-5 py-4 text-sm text-slate-400">
                No reviews scheduled
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {day.items.map((item) => (
                  <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.lastScore < 3 ? "bg-red-500" :
                        item.lastScore < 4 ? "bg-yellow-500" :
                        "bg-emerald-500"
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.unitName}</p>
                        <p className="text-xs text-slate-500">
                          Interval: {item.interval}d | Last: {item.lastScore.toFixed(1)}/5 | EF: {item.easeFactor.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/quizzes/${item.quizId}`}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        i === 0
                          ? "bg-academic-600 text-white hover:bg-academic-700"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {i === 0 ? "Review Now" : "Preview"}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Later Items */}
      {laterItems.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Later ({laterItems.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {laterItems.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.unitName}</p>
                  <p className="text-xs text-slate-500">
                    In {getDaysUntilReview(item)} days | Interval: {item.interval}d
                  </p>
                </div>
                <Link
                  href={`/quizzes/${item.quizId}`}
                  className="text-xs text-slate-500 hover:text-academic-600"
                >
                  View Quiz
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.scheduleItems.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-slate-500 mb-1">No reviews scheduled</p>
          <p className="text-sm text-slate-400 mb-4">Take a quiz to schedule your first spaced repetition review.</p>
          <Link href="/quizzes" className="text-sm text-academic-600 hover:text-academic-700 font-medium">
            Go to Quizzes
          </Link>
        </div>
      )}
    </div>
  );
}
