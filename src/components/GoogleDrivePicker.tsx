"use client";

import { useState, useEffect, useCallback } from "react";
import { useAcademic } from "@/context/AcademicContext";
import { DriveFile, DriveFolder } from "@/types";
import {
  signInWithGoogle,
  listDriveFolders,
  listDriveFiles,
  downloadDriveFileText,
} from "@/lib/google-api";
import { formatFileSize, titleFromFilename } from "@/lib/file-processor";

interface GoogleDrivePickerProps {
  unitId: string;
  onImport: (type: "pdf" | "video" | "text", title: string, text: string) => void;
  onClose: () => void;
}

type View = "connect" | "folders" | "files" | "importing";

function mimeToContentType(mime: string): "pdf" | "video" | "text" {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("video")) return "video";
  return "text";
}

function mimeToLabel(mime: string): string {
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("video")) return "Video";
  if (mime.includes("presentation") || mime.includes("slides")) return "Slides";
  if (mime.includes("document") || mime.includes("docs")) return "Doc";
  if (mime.includes("spreadsheet") || mime.includes("sheet")) return "Sheet";
  return "Text";
}

function mimeToColor(mime: string): string {
  if (mime.includes("pdf")) return "bg-orange-50 text-orange-600";
  if (mime.includes("video")) return "bg-purple-50 text-purple-600";
  if (mime.includes("presentation") || mime.includes("slides"))
    return "bg-yellow-50 text-yellow-600";
  return "bg-slate-100 text-slate-600";
}

export default function GoogleDrivePicker({
  unitId,
  onImport,
  onClose,
}: GoogleDrivePickerProps) {
  const { state, setGoogleConnection, linkDriveFolder, getLinkedFolder, updateDriveFolderSync } =
    useAcademic();
  const { googleConnection } = state;

  const linkedFolder = getLinkedFolder(unitId);

  const [view, setView] = useState<View>(
    googleConnection.connected ? (linkedFolder ? "files" : "folders") : "connect"
  );
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(
    linkedFolder?.folder || null
  );
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    fileName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Connect ---
  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const connection = await signInWithGoogle();
      setGoogleConnection(connection);
      setView("folders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  // --- Load folders ---
  const loadFolders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listDriveFolders(googleConnection.accessToken);
      setFolders(result);
    } catch {
      setError("Failed to load folders");
    } finally {
      setLoading(false);
    }
  }, [googleConnection.accessToken]);

  // --- Load files ---
  const loadFiles = useCallback(
    async (folder: DriveFolder) => {
      setLoading(true);
      try {
        const result = await listDriveFiles(folder.id, googleConnection.accessToken);
        setFiles(result);
      } catch {
        setError("Failed to load files");
      } finally {
        setLoading(false);
      }
    },
    [googleConnection.accessToken]
  );

  useEffect(() => {
    if (view === "folders" && googleConnection.connected) {
      loadFolders();
    }
  }, [view, googleConnection.connected, loadFolders]);

  useEffect(() => {
    if (view === "files" && selectedFolder) {
      loadFiles(selectedFolder);
    }
  }, [view, selectedFolder, loadFiles]);

  const handleSelectFolder = (folder: DriveFolder) => {
    setSelectedFolder(folder);
    linkDriveFolder(unitId, folder);
    setView("files");
  };

  const toggleFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleImport = async () => {
    const toImport = files.filter((f) => selectedFiles.has(f.id));
    if (toImport.length === 0) return;

    setView("importing");

    for (let i = 0; i < toImport.length; i++) {
      const file = toImport[i];
      setImportProgress({
        current: i + 1,
        total: toImport.length,
        fileName: file.name,
      });

      try {
        const text = await downloadDriveFileText(
          file.id,
          file.mimeType,
          googleConnection.accessToken
        );
        const type = mimeToContentType(file.mimeType);
        const title = titleFromFilename(file.name);
        onImport(type, title, text);
      } catch {
        // Skip failed files silently
      }
    }

    updateDriveFolderSync(unitId);
    setImportProgress(null);
    onClose();
  };

  const handleRefresh = () => {
    if (selectedFolder) loadFiles(selectedFolder);
  };

  // ============================
  // RENDER
  // ============================

  // Connect screen
  if (view === "connect") {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Connect Google Drive</h3>
              <p className="text-xs text-slate-500">Import lecture slides, PDFs and notes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-slate-50 rounded-lg p-4 mb-5">
          <p className="text-sm text-slate-600 leading-relaxed">
            Link your Google Drive to quickly import course materials. AcademicOS will have
            <strong> read-only </strong> access to files you select.
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Read-only access
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Disconnect anytime
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No data stored on our servers
            </span>
          </div>
        </div>

        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" fill="#4285F4" />
              </svg>
              Sign in with Google
            </>
          )}
        </button>
      </div>
    );
  }

  // Importing progress
  if (view === "importing" && importProgress) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Importing from Google Drive...
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">{importProgress.fileName}</p>
              <p className="text-xs text-slate-400">
                File {importProgress.current} of {importProgress.total}
              </p>
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(importProgress.current / importProgress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Folder picker
  if (view === "folders") {
    return (
      <div className="bg-white border border-slate-200 rounded-xl">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Select a Drive Folder</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Link a folder to this unit for quick access
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <svg className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-slate-500">Loading folders from Drive...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleSelectFolder(folder)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{folder.name}</p>
                </div>
                <svg className="w-4 h-4 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {googleConnection.connected && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <p className="text-xs text-slate-500">
              Connected as <span className="font-medium text-slate-700">{googleConnection.email}</span>
            </p>
          </div>
        )}
      </div>
    );
  }

  // File browser
  return (
    <div className="bg-white border border-slate-200 rounded-xl">
      <div className="px-5 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedFolder(null); setView("folders"); setSelectedFiles(new Set()); }}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <h3 className="text-sm font-semibold text-slate-900 truncate max-w-[200px]">
                {selectedFolder?.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Refresh"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {linkedFolder && (
          <div className="flex items-center gap-1.5 mt-2">
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            <span className="text-xs text-emerald-600 font-medium">Linked to this unit</span>
            {linkedFolder.lastSyncedAt && (
              <span className="text-xs text-slate-400 ml-1">
                Synced {new Date(linkedFolder.lastSyncedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <svg className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-slate-500">Loading files...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">
          No files found in this folder.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {files.map((file) => {
            const selected = selectedFiles.has(file.id);
            return (
              <label
                key={file.id}
                className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                  selected ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleFile(file.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${mimeToColor(file.mimeType)}`}>
                      {mimeToLabel(file.mimeType)}
                    </span>
                    <p className="text-sm text-slate-800 truncate">{file.name}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                    {file.size ? <span>{formatFileSize(file.size)}</span> : null}
                    {file.modifiedTime && (
                      <span>{new Date(file.modifiedTime).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}

      {/* Action bar */}
      <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 rounded-b-xl flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {selectedFiles.size > 0
            ? `${selectedFiles.size} file${selectedFiles.size > 1 ? "s" : ""} selected`
            : "Select files to import"}
        </p>
        <button
          onClick={handleImport}
          disabled={selectedFiles.size === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Import to Unit
        </button>
      </div>
    </div>
  );
}
