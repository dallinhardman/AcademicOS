"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";
import { Content } from "@/types";

const TYPE_LABELS: Record<Content["type"], string> = {
  pdf: "PDF",
  video: "Video",
  youtube: "YouTube",
  text: "Text / Notes",
};

export default function UnitDetailPage() {
  const params = useParams();
  const unitId = params.id as string;
  const {
    state,
    addContent,
    deleteContent,
    generateSummaryForUnit,
    getContentsForUnit,
    getSummariesForUnit,
    getQuizzesForUnit,
  } = useAcademic();

  const unit = state.units.find((u) => u.id === unitId);
  const semester = unit ? state.semesters.find((s) => s.id === unit.semesterId) : null;
  const contents = getContentsForUnit(unitId);
  const summaries = getSummariesForUnit(unitId);
  const quizzes = getQuizzesForUnit(unitId);

  const [showUpload, setShowUpload] = useState(false);
  const [contentType, setContentType] = useState<Content["type"]>("text");
  const [contentTitle, setContentTitle] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [contentText, setContentText] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleUpload = () => {
    if (!contentTitle.trim() || !contentText.trim()) return;
    addContent(
      unitId,
      contentType,
      contentTitle.trim(),
      contentText.trim(),
      contentUrl.trim() || undefined
    );
    setContentTitle("");
    setContentUrl("");
    setContentText("");
    setShowUpload(false);
  };

  const handleGenerateSummary = () => {
    setGenerating(true);
    // Simulate processing delay
    setTimeout(() => {
      generateSummaryForUnit(unitId);
      setGenerating(false);
    }, 1500);
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
        <div className="flex gap-2">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload Content
          </button>
          {contents.length > 0 && (
            <button
              onClick={handleGenerateSummary}
              disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating...
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
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Upload Content</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              {(Object.keys(TYPE_LABELS) as Content["type"][]).map((t) => (
                <button
                  key={t}
                  onClick={() => setContentType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    contentType === t
                      ? "bg-academic-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={contentTitle}
              onChange={(e) => setContentTitle(e.target.value)}
              placeholder="Content title"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent"
            />
            {(contentType === "youtube" || contentType === "video") && (
              <input
                type="text"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder={contentType === "youtube" ? "YouTube URL" : "Video URL"}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent"
              />
            )}
            <textarea
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder={
                contentType === "youtube"
                  ? "Paste the video transcript here (or text extracted from the video)"
                  : contentType === "pdf"
                  ? "Paste the extracted text from the PDF"
                  : "Paste your lecture notes, transcript, or content here"
              }
              rows={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent resize-y"
            />
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700"
              >
                Add Content
              </button>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setContentTitle("");
                  setContentUrl("");
                  setContentText("");
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Files */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-base font-semibold text-slate-900">Content ({contents.length})</h2>
            </div>
            {contents.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">
                No content uploaded yet. Upload content to generate summaries.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {contents.map((c) => (
                  <div key={c.id} className="px-6 py-4 flex items-center justify-between group">
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
                          {c.rawText.length.toLocaleString()} chars
                          {c.status === "processing" && " - Processing..."}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteContent(c.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Summaries & Quizzes */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Study Guides ({summaries.length})</h2>
            </div>
            {summaries.length === 0 ? (
              <div className="px-5 py-6 text-center text-xs text-slate-400">
                Generate a summary from your content.
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
        </div>
      </div>
    </div>
  );
}
