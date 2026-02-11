"use client";

import { useState, useRef, useCallback } from "react";
import { Content } from "@/types";
import {
  detectContentType,
  formatFileSize,
  titleFromFilename,
  countWords,
  getStepsForType,
  readTextFile,
  extractTextFromPDF,
  generateVideoPlaceholder,
  ProcessingStep,
} from "@/lib/file-processor";

interface ContentUploaderProps {
  onAdd: (type: Content["type"], title: string, text: string, url?: string) => void;
  compact?: boolean;
  onOpenGoogleDrive?: () => void;
  googleConnected?: boolean;
}

type Mode = "idle" | "processing" | "preview" | "paste" | "youtube" | "success";

export default function ContentUploader({ onAdd, compact, onOpenGoogleDrive, googleConnected }: ContentUploaderProps) {
  const [mode, setMode] = useState<Mode>("idle");
  const [dragActive, setDragActive] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [fileType, setFileType] = useState<Content["type"]>("text");
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Step runner ----
  const runSteps = async (
    stepsArr: ProcessingStep[],
    durations: number[]
  ) => {
    for (let i = 0; i < stepsArr.length; i++) {
      stepsArr[i].status = "active";
      setSteps([...stepsArr]);
      await new Promise((r) => setTimeout(r, durations[i] || 500));
      stepsArr[i].status = "done";
      setSteps([...stepsArr]);
    }
  };

  // ---- File processing ----
  const processFile = useCallback(async (file: File) => {
    const type = detectContentType(file);
    const stepsArr = getStepsForType(type);

    setMode("processing");
    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setFileType(type);
    setTitle(titleFromFilename(file.name));
    setText("");
    setError(null);
    setSteps([...stepsArr]);

    try {
      if (type === "text") {
        await runSteps(stepsArr, [400, 300]);
        const content = await readTextFile(file);
        setText(content);
      } else if (type === "pdf") {
        // Step 1: Reading
        stepsArr[0].status = "active";
        setSteps([...stepsArr]);
        await new Promise((r) => setTimeout(r, 400));
        stepsArr[0].status = "done";

        // Step 2: Extracting (actual work happens here)
        stepsArr[1].status = "active";
        setSteps([...stepsArr]);

        const content = await extractTextFromPDF(file);

        stepsArr[1].status = "done";

        // Step 3: Cleaning
        stepsArr[2].status = "active";
        setSteps([...stepsArr]);
        await new Promise((r) => setTimeout(r, 300));
        stepsArr[2].status = "done";
        setSteps([...stepsArr]);

        setText(content);
      } else if (type === "video") {
        await runSteps(stepsArr, [500, 700, 1200, 400]);
        setText(generateVideoPlaceholder(file.name));
      }

      setMode("preview");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process file. Try pasting the text manually."
      );
      setMode("preview");
    }
  }, []);

  // ---- Drag & drop ----
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so the same file can be selected again
      e.target.value = "";
    },
    [processFile]
  );

  // ---- Submit ----
  const handleSubmit = () => {
    if (!title.trim() || !text.trim()) return;
    onAdd(fileType, title.trim(), text.trim(), url.trim() || undefined);
    setMode("success");
    setTimeout(() => setMode("idle"), 2000);
  };

  const resetForm = () => {
    setMode("idle");
    setSteps([]);
    setFileName("");
    setFileSize("");
    setTitle("");
    setText("");
    setUrl("");
    setError(null);
  };

  // ---- YouTube smart detection ----
  const handleUrlChange = (val: string) => {
    setUrl(val);
    // Auto-title from YouTube URL
    if (val.includes("youtube.com") || val.includes("youtu.be")) {
      if (!title) setTitle("YouTube Lecture");
    }
  };

  // ==================================================
  // RENDER
  // ==================================================

  // Success flash
  if (mode === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
        <svg className="w-8 h-8 text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-semibold text-emerald-800">Content added!</p>
        <p className="text-xs text-emerald-600 mt-1">You can upload more or generate a summary.</p>
      </div>
    );
  }

  // Processing a file
  if (mode === "processing") {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              fileType === "pdf" ? "bg-orange-100" :
              fileType === "video" ? "bg-purple-100" :
              "bg-slate-100"
            }`}>
              {fileType === "pdf" ? (
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ) : fileType === "video" ? (
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{fileName}</p>
              <p className="text-xs text-slate-500">{fileSize}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {step.status === "done" ? (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : step.status === "active" ? (
                  <svg className="w-5 h-5 text-academic-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 ml-0.5" />
                )}
              </div>
              <span className={`text-sm ${
                step.status === "done" ? "text-emerald-700" :
                step.status === "active" ? "text-academic-700 font-medium" :
                "text-slate-400"
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Preview extracted content (ready to confirm)
  if (mode === "preview") {
    const wordCount = countWords(text);
    const isVideo = fileType === "video";

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              fileType === "pdf" ? "bg-orange-50 text-orange-600" :
              fileType === "video" ? "bg-purple-50 text-purple-600" :
              "bg-slate-100 text-slate-600"
            }`}>
              {fileType === "pdf" ? "PDF" : fileType === "video" ? "Video" : "Text"}
            </span>
            <span className="text-sm font-medium text-slate-700">{fileName}</span>
            {!error && (
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </div>
          <button onClick={resetForm} className="text-xs text-slate-500 hover:text-slate-700">
            Cancel
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-500 mt-1">You can paste the text manually below.</p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-500">
                {isVideo ? "Transcript" : "Extracted Text"}
              </label>
              {text && !error && (
                <span className="text-xs text-slate-400">
                  {wordCount.toLocaleString()} words / {text.length.toLocaleString()} chars
                </span>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={isVideo ? "Paste the video transcript here..." : "Paste or edit the extracted text..."}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent resize-y font-mono text-xs leading-relaxed"
            />
            {text && !error && (
              <p className="text-xs text-slate-400 mt-1">
                Preview: &ldquo;{text.slice(0, 120).trim()}{text.length > 120 ? "..." : ""}&rdquo;
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !text.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add to Unit
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Paste text mode
  if (mode === "paste") {
    const wordCount = countWords(text);
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">Paste Text</h3>
          <button onClick={resetForm} className="text-xs text-slate-500 hover:text-slate-700">
            Back
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 2 Lecture Notes"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-500">Content</label>
              {text && (
                <span className="text-xs text-slate-400">{wordCount.toLocaleString()} words</span>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="Paste your lecture notes, textbook content, or any study material here..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent resize-y"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setFileType("text"); handleSubmit(); }}
              disabled={!title.trim() || !text.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add to Unit
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // YouTube link mode
  if (mode === "youtube") {
    const wordCount = countWords(text);
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900">YouTube / Video Link</h3>
          <button onClick={resetForm} className="text-xs text-slate-500 hover:text-slate-700">
            Back
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Video URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 2: Macroeconomics"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-slate-500">Transcript</label>
              {text && (
                <span className="text-xs text-slate-400">{wordCount.toLocaleString()} words</span>
              )}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder={"Paste the video transcript here.\n\nTip: On YouTube, click '...' below the video > 'Show transcript' to copy it."}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-academic-500 focus:border-transparent resize-y"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setFileType("youtube"); handleSubmit(); }}
              disabled={!title.trim() || !text.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add to Unit
            </button>
            <button onClick={resetForm} className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- IDLE: Main drag-and-drop zone ----
  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl transition-all cursor-pointer ${
          compact ? "p-6" : "p-10"
        } ${
          dragActive
            ? "border-academic-400 bg-academic-50 scale-[1.01]"
            : "border-slate-300 bg-white hover:border-academic-300 hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.csv,.pdf,.mp4,.mov,.webm,.avi"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="text-center">
          <div className={`mx-auto mb-3 rounded-xl flex items-center justify-center ${
            dragActive ? "bg-academic-100" : "bg-slate-100"
          } ${compact ? "w-10 h-10" : "w-14 h-14"}`}>
            <svg className={`${compact ? "w-5 h-5" : "w-7 h-7"} ${dragActive ? "text-academic-600" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          <p className={`font-semibold ${compact ? "text-sm" : "text-base"} ${
            dragActive ? "text-academic-700" : "text-slate-700"
          }`}>
            {dragActive ? "Drop file here" : "Drop a file to get started"}
          </p>
          <p className="text-xs text-slate-400 mt-1.5">
            PDF, text files (.txt, .md), or video (.mp4, .mov)
          </p>

          {!compact && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                PDF with OCR
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Text files
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                Video with ASR
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alternative input methods */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 shrink-0">or add manually</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="grid gap-2 grid-cols-3">
        <button
          onClick={() => setMode("paste")}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
          Paste Text
        </button>
        <button
          onClick={() => setMode("youtube")}
          className="flex items-center justify-center gap-2 px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-slate-300 hover:text-slate-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          YouTube Link
        </button>
        {onOpenGoogleDrive && (
          <button
            onClick={onOpenGoogleDrive}
            className="flex items-center justify-center gap-2 px-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
            </svg>
            {googleConnected ? "Google Drive" : "Connect Drive"}
          </button>
        )}
      </div>
    </div>
  );
}
