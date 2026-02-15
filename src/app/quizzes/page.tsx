"use client";

import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";

export default function QuizzesPage() {
  const { state } = useAcademic();

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
        <p className="text-slate-600 mt-1">Test your knowledge with active recall quizzes.</p>
      </div>

      {state.quizzes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          <p className="text-slate-500 mb-1">No quizzes yet</p>
          <p className="text-sm text-slate-400 mb-4">Generate a study summary first, then create quizzes from it.</p>
          <Link href="/summaries" className="text-sm text-academic-600 hover:text-academic-700 font-medium">
            Go to Summaries
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {state.quizzes.map((quiz) => {
            const unit = state.units.find((u) => u.id === quiz.unitId);
            const attempts = state.quizAttempts.filter((a) => a.quizId === quiz.id);
            const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
            const mcqCount = quiz.questions.filter((q) => q.type === "mcq").length;
            const flashcardCount = quiz.questions.filter((q) => q.type === "flashcard").length;

            return (
              <Link
                key={quiz.id}
                href={`/quizzes/${quiz.id}`}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-academic-700 transition-colors">
                      {quiz.title}
                    </h3>
                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                      {unit && <span className="bg-slate-100 px-2 py-0.5 rounded">{unit.subject}</span>}
                      <span>{mcqCount} MCQs</span>
                      <span>{flashcardCount} flashcards</span>
                      <span>{attempts.length} attempts</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {lastAttempt && (
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      lastAttempt.score >= 80 ? "bg-emerald-50 text-emerald-700" :
                      lastAttempt.score >= 60 ? "bg-yellow-50 text-yellow-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      {Math.round(lastAttempt.score)}%
                    </span>
                  )}
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
