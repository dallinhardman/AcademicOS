"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";
import { summaryToMarkdown } from "@/lib/summarizer";
import { useState } from "react";

export default function SummaryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const summaryId = params.id as string;
  const { state, generateQuizForSummary, deleteSummary } = useAcademic();

  const summary = state.summaries.find((s) => s.id === summaryId);
  const unit = summary ? state.units.find((u) => u.id === summary.unitId) : null;
  const existingQuizzes = state.quizzes.filter((q) => q.summaryId === summaryId);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  if (!summary) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Summary not found.</p>
        <Link href="/summaries" className="text-academic-600 hover:text-academic-700 text-sm mt-2 inline-block">
          Back to summaries
        </Link>
      </div>
    );
  }

  const handleExportMarkdown = () => {
    const md = summaryToMarkdown(summary);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${summary.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateQuiz = () => {
    setGeneratingQuiz(true);
    setTimeout(() => {
      const quiz = generateQuizForSummary(summaryId);
      setGeneratingQuiz(false);
      if (quiz) {
        router.push(`/quizzes/${quiz.id}`);
      }
    }, 1000);
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-2">
        <Link href="/summaries" className="text-sm text-slate-500 hover:text-slate-700">Summaries</Link>
        <span className="text-sm text-slate-400 mx-2">/</span>
        <span className="text-sm text-slate-700">{summary.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{summary.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            {unit && (
              <Link href={`/units/${unit.id}`} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded hover:bg-slate-200">
                {unit.name}
              </Link>
            )}
            <span className="text-xs text-slate-400">
              Generated {new Date(summary.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export .md
          </button>
          <button
            onClick={handleGenerateQuiz}
            disabled={generatingQuiz}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {generatingQuiz ? "Generating..." : "Test Me on This"}
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this summary?")) {
                deleteSummary(summaryId);
                router.push("/summaries");
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Delete
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-academic-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
          Executive Summary
        </h2>
        <ul className="space-y-3">
          {summary.executiveSummary.map((point, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-700">
              <span className="w-6 h-6 bg-academic-50 text-academic-700 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold mt-0.5">
                {i + 1}
              </span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Key Definitions */}
      {summary.keyDefinitions.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Key Definitions
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {summary.keyDefinitions.map((def, i) => (
              <div key={i} className="bg-slate-50 rounded-lg p-4">
                <dt className="text-sm font-semibold text-slate-900">{def.term}</dt>
                <dd className="text-sm text-slate-600 mt-1 leading-relaxed">{def.definition}</dd>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Detailed Breakdown
        </h2>
        <div className="space-y-6">
          {summary.detailedBreakdown.map((section, i) => (
            <div key={i}>
              <h3 className="text-base font-semibold text-slate-800 mb-2">{section.heading}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Quizzes */}
      {existingQuizzes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-3">Quizzes from this Summary</h2>
          <div className="space-y-2">
            {existingQuizzes.map((q) => (
              <Link
                key={q.id}
                href={`/quizzes/${q.id}`}
                className="block p-3 bg-purple-50 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-100 transition-colors"
              >
                {q.title} ({q.questions.length} questions)
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
