"use client";

import { useState } from "react";
import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";
import { getDaysUntilReview } from "@/lib/scheduler";
import { signInWithGoogle, createCalendarEvent } from "@/lib/google-api";
import { CalendarSyncStatus } from "@/types";

export default function SchedulePage() {
  const { state, getDueScheduleItems, getUpcomingScheduleItems, setGoogleConnection, setCalendarSync } = useAcademic();
  const dueItems = getDueScheduleItems();
  const upcomingItems = getUpcomingScheduleItems();
  const { googleConnection, calendarSync } = state;

  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleCalendarSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);

    try {
      // Connect to Google if not already
      let token = googleConnection.accessToken;
      if (!googleConnection.connected) {
        const connection = await signInWithGoogle();
        setGoogleConnection(connection);
        token = connection.accessToken;
      }

      const syncedEventIds: Record<string, string> = { ...calendarSync.syncedEventIds };

      // Sync each schedule item as a calendar event
      for (const item of state.scheduleItems) {
        if (syncedEventIds[item.id]) continue; // Already synced

        const reviewDate = new Date(item.nextReviewDate);
        const dateStr = reviewDate.toISOString().split("T")[0];

        const eventId = await createCalendarEvent(
          {
            summary: `Review: ${item.unitName}`,
            description: [
              `AcademicOS spaced repetition review`,
              `Last score: ${item.lastScore.toFixed(1)}/5`,
              `Interval: ${item.interval} days`,
              `Ease Factor: ${item.easeFactor.toFixed(2)}`,
            ].join("\n"),
            start: dateStr,
            end: dateStr,
            colorId: item.lastScore < 3 ? "11" : item.lastScore < 4 ? "5" : "10",
          },
          token
        );

        syncedEventIds[item.id] = eventId;
      }

      const newSync: CalendarSyncStatus = {
        enabled: true,
        calendarId: "primary",
        lastSyncedAt: new Date().toISOString(),
        syncedEventIds,
      };
      setCalendarSync(newSync);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch {
      // Silently fail for demo
    } finally {
      setSyncing(false);
    }
  };

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
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Review Schedule</h1>
          <p className="text-slate-600 mt-1">
            Spaced repetition calendar powered by the SM-2 algorithm. Weak topics are reviewed sooner, strong topics later.
          </p>
        </div>
        {state.scheduleItems.length > 0 && (
          <button
            onClick={handleCalendarSync}
            disabled={syncing}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all shrink-0 ${
              syncSuccess
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : calendarSync.enabled
                ? "bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-700"
                : "bg-white border-2 border-dashed border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-700"
            }`}
          >
            {syncing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing...
              </>
            ) : syncSuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Synced to Google Calendar!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                </svg>
                {calendarSync.enabled ? "Sync to Calendar" : "Add to Google Calendar"}
              </>
            )}
          </button>
        )}
      </div>

      {/* Calendar sync status */}
      {calendarSync.enabled && calendarSync.lastSyncedAt && !syncSuccess && (
        <div className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl">
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <p className="text-xs text-blue-700">
            <span className="font-medium">Google Calendar synced</span>
            <span className="text-blue-500 ml-1">
              &middot; {Object.keys(calendarSync.syncedEventIds).length} events
              &middot; Last synced {new Date(calendarSync.lastSyncedAt).toLocaleString()}
            </span>
          </p>
          {googleConnection.connected && (
            <span className="text-xs text-blue-500 ml-auto">{googleConnection.email}</span>
          )}
        </div>
      )}

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
