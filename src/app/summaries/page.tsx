"use client";

import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";

export default function SummariesPage() {
  const { state } = useAcademic();

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Study Summaries</h1>
        <p className="text-slate-600 mt-1">AI-generated study guides from your course content.</p>
      </div>

      {state.summaries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-slate-500 mb-1">No study guides yet</p>
          <p className="text-sm text-slate-400 mb-4">Upload content to a unit and generate a summary.</p>
          <Link href="/semesters" className="text-sm text-academic-600 hover:text-academic-700 font-medium">
            Go to Semesters
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {state.summaries.map((summary) => {
            const unit = state.units.find((u) => u.id === summary.unitId);
            const quizzes = state.quizzes.filter((q) => q.summaryId === summary.id);
            return (
              <Link
                key={summary.id}
                href={`/summaries/${summary.id}`}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-academic-700 transition-colors">
                      {summary.title}
                    </h3>
                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                      {unit && <span className="bg-slate-100 px-2 py-0.5 rounded">{unit.subject}</span>}
                      <span>{summary.executiveSummary.length} key points</span>
                      <span>{summary.keyDefinitions.length} definitions</span>
                      <span>{quizzes.length} quizzes</span>
                    </div>
                  </div>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
