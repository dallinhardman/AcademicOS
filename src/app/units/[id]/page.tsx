"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";
import { Content } from "@/types";
import ContentUploader from "@/components/ContentUploader";
import { ProcessingStep } from "@/lib/file-processor";

const TYPE_LABELS: Record<Content["type"], string> = {
  pdf: "PDF",
  video: "Video",
  youtube: "YouTube",
  text: "Text / Notes",
};

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params.id as string;
  const {
    state,
    addContent,
    deleteContent,
    generateSummaryForUnit,
    generateQuizForSummary,
    getContentsForUnit,
    getSummariesForUnit,
    getQuizzesForUnit,
  } = useAcademic();

  const unit = state.units.find((u) => u.id === unitId);
  const semester = unit ? state.semesters.find((s) => s.id === unit.semesterId) : null;
  const contents = getContentsForUnit(unitId);
  const summaries = getSummariesForUnit(unitId);
  const quizzes = getQuizzesForUnit(unitId);

  // Summary generation pipeline
  const [processing, setProcessing] = useState(false);
  const [stages, setStages] = useState<ProcessingStep[]>([]);
  const [lastGeneratedSummaryId, setLastGeneratedSummaryId] = useState<string | null>(null);
  const [expandedContent, setExpandedContent] = useState<string | null>(null);

  const handleAddContent = (type: Content["type"], title: string, text: string, url?: string) => {
    addContent(unitId, type, title, text, url);
  };

  const runProcessingPipeline = async () => {
    setProcessing(true);
    setLastGeneratedSummaryId(null);

    const pipelineStages: ProcessingStep[] = [
      { label: "Analyzing content sources", status: "pending" },
      { label: "Extracting key concepts", status: "pending" },
      { label: "Building knowledge graph", status: "pending" },
      { label: "Generating executive summary", status: "pending" },
      { label: "Extracting definitions & glossary", status: "pending" },
      { label: "Writing detailed breakdown", status: "pending" },
    ];

    setStages([...pipelineStages]);

    const durations = [600, 800, 700, 900, 700, 600];
    for (let i = 0; i < pipelineStages.length; i++) {
      pipelineStages[i].status = "active";
      setStages([...pipelineStages]);
      await new Promise((r) => setTimeout(r, durations[i]));
      pipelineStages[i].status = "done";
      setStages([...pipelineStages]);
    }

    const summary = generateSummaryForUnit(unitId);
    await new Promise((r) => setTimeout(r, 400));
    setProcessing(false);

    if (summary) setLastGeneratedSummaryId(summary.id);
  };

  if (!unit) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Unit not found.</p>
        <Link href="/semesters" className="text-academic-600 hover:text-academic-700 text-sm mt-2 inline-block">
          Back to semesters
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      {/* Breadcrumb */}
      <div className="mb-2">
        <Link href="/semesters" className="text-sm text-slate-500 hover:text-slate-700">Semesters</Link>
        <span className="text-sm text-slate-400 mx-2">/</span>
        {semester && (
          <>
            <Link href={`/semesters/${semester.id}`} className="text-sm text-slate-500 hover:text-slate-700">
              {semester.name}
            </Link>
            <span className="text-sm text-slate-400 mx-2">/</span>
          </>
        )}
        <span className="text-sm text-slate-700">{unit.name}</span>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{unit.name}</h1>
          <p className="text-slate-600 mt-1">
            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">{unit.subject}</span>
          </p>
        </div>
        {contents.length > 0 && (
          <button
            onClick={runProcessingPipeline}
            disabled={processing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {processing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Generate Summary
              </>
            )}
          </button>
        )}
      </div>

      {/* Summary Generation Pipeline */}
      {(processing || lastGeneratedSummaryId) && stages.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              {processing ? "Processing Content..." : "Summary Generated!"}
            </h3>
            {!processing && lastGeneratedSummaryId && (
              <div className="flex gap-2">
                <Link
                  href={`/summaries/${lastGeneratedSummaryId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
                >
                  View Study Guide
                </Link>
                <button
                  onClick={() => {
                    const quiz = generateQuizForSummary(lastGeneratedSummaryId);
                    if (quiz) router.push(`/quizzes/${quiz.id}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors"
                >
                  Test Me on This
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  {stage.status === "done" ? (
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : stage.status === "active" ? (
                    <svg className="w-5 h-5 text-academic-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200 ml-0.5" />
                  )}
                </div>
                <span className={`text-sm ${
                  stage.status === "done" ? "text-emerald-700" :
                  stage.status === "active" ? "text-academic-700 font-medium" :
                  "text-slate-400"
                }`}>
                  {stage.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upload area — hero when empty, compact when content exists */}
          <ContentUploader onAdd={handleAddContent} compact={contents.length > 0} />

          {/* Content list */}
          {contents.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-base font-semibold text-slate-900">
                  Uploaded Content ({contents.length})
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {contents.map((c) => (
                  <div key={c.id} className="group">
                    <div
                      className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedContent(expandedContent === c.id ? null : c.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          c.type === "youtube" ? "bg-red-50 text-red-600" :
                          c.type === "pdf" ? "bg-orange-50 text-orange-600" :
                          c.type === "video" ? "bg-purple-50 text-purple-600" :
                          "bg-slate-100 text-slate-600"
                        }`}>
                          {TYPE_LABELS[c.type]}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{c.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {c.rawText.split(/\s+/).filter(Boolean).length.toLocaleString()} words
                            {c.url && (
                              <span className="ml-2 text-academic-500">
                                {c.url.length > 35 ? c.url.slice(0, 35) + "..." : c.url}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteContent(c.id);
                          }}
                          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <svg className={`w-4 h-4 text-slate-400 transition-transform ${expandedContent === c.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </div>
                    </div>
                    {/* Expandable preview */}
                    {expandedContent === c.id && (
                      <div className="px-6 pb-4">
                        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 leading-relaxed font-mono max-h-40 overflow-y-auto">
                          {c.rawText.slice(0, 800)}
                          {c.rawText.length > 800 && (
                            <span className="text-slate-400">... ({c.rawText.length - 800} more chars)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Summaries & Quizzes */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Study Guides ({summaries.length})</h2>
            </div>
            {summaries.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-slate-400">
                Upload content, then click &quot;Generate Summary&quot;.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {summaries.map((s) => (
                  <Link
                    key={s.id}
                    href={`/summaries/${s.id}`}
                    className="block px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-academic-700">{s.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {s.executiveSummary.length} key points, {s.keyDefinitions.length} definitions
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Quizzes ({quizzes.length})</h2>
            </div>
            {quizzes.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-slate-400">
                Generate a summary first, then create quizzes.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {quizzes.map((q) => (
                  <Link
                    key={q.id}
                    href={`/quizzes/${q.id}`}
                    className="block px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-purple-700">{q.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{q.questions.length} questions</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Next step hint */}
          {contents.length > 0 && summaries.length === 0 && !processing && (
            <div className="bg-academic-50 border border-academic-200 rounded-xl p-4">
              <p className="text-sm text-academic-800 font-medium mb-1">Ready to summarize!</p>
              <p className="text-xs text-academic-600 mb-3">
                You have {contents.length} content source{contents.length > 1 ? "s" : ""}. Click the button above to generate your study guide.
              </p>
              <button
                onClick={runProcessingPipeline}
                className="text-xs font-medium text-white bg-academic-600 px-3 py-1.5 rounded-lg hover:bg-academic-700 transition-colors"
              >
                Generate Summary
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
