import { Content } from "@/types";

// ---- Helpers ----

export function detectContentType(file: File): Content["type"] {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (ext === "pdf") return "pdf";
  if (["mp4", "mov", "webm", "avi", "mkv", "m4v"].includes(ext)) return "video";
  return "text";
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function titleFromFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export type ProcessingStep = {
  label: string;
  status: "pending" | "active" | "done";
};

export function getStepsForType(type: Content["type"]): ProcessingStep[] {
  switch (type) {
    case "pdf":
      return [
        { label: "Reading PDF document", status: "pending" },
        { label: "Extracting text with OCR", status: "pending" },
        { label: "Cleaning & formatting", status: "pending" },
      ];
    case "video":
      return [
        { label: "Analyzing video file", status: "pending" },
        { label: "Extracting audio track", status: "pending" },
        { label: "Transcribing with Whisper ASR", status: "pending" },
        { label: "Formatting transcript", status: "pending" },
      ];
    default:
      return [
        { label: "Reading file contents", status: "pending" },
        { label: "Processing text", status: "pending" },
      ];
  }
}

// ---- Extractors ----

export async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamic import to avoid SSR issues in Next.js
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf");

  // Disable worker — runs on main thread, fine for lecture PDFs
  if (typeof pdfjsLib.GlobalWorkerOptions !== "undefined") {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "";
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const text = tc.items.map((item: any) => item.str).join(" ");
    if (text.trim()) pages.push(text.trim());
  }

  return pages.join("\n\n");
}

/**
 * For video files we can't transcribe client-side, but we simulate the
 * processing pipeline and return a placeholder that the user can replace
 * with a real transcript.
 */
export function generateVideoPlaceholder(fileName: string): string {
  return [
    `[Auto-transcription of "${fileName}"]`,
    "",
    "Note: In production, this video would be transcribed automatically using OpenAI Whisper ASR.",
    "For this demo, please replace this text with the actual lecture transcript or notes.",
    "",
    "You can get a transcript from:",
    "- YouTube: Click '...' > 'Show transcript' below any video",
    "- Zoom: Recordings include auto-generated transcripts",
    "- Otter.ai, Descript, or similar transcription services",
    "",
    "Once you paste the real transcript, click 'Add to Unit' to continue.",
  ].join("\n");
}
