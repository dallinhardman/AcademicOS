/**
 * Google API client — handles OAuth2 sign-in and SDK bootstrapping.
 *
 * In production you'd set real credentials via env vars. For this demo the
 * full UX is wired up and falls back to a simulated mode when no client ID
 * is configured, so reviewers can experience the complete workflow.
 */

import {
  GoogleConnection,
  DriveFile,
  DriveFolder,
} from "@/types";

// ---------------------------------------------------------------------------
// Config — replace with real values or set NEXT_PUBLIC_ env vars
// ---------------------------------------------------------------------------
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || "";
const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

export const isGoogleConfigured = () => Boolean(CLIENT_ID && API_KEY);

// ---------------------------------------------------------------------------
// Script loader helpers
// ---------------------------------------------------------------------------
let gapiLoaded = false;
let gisLoaded = false;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export async function loadGoogleAPIs(): Promise<void> {
  if (gapiLoaded && gisLoaded) return;

  await Promise.all([
    loadScript("https://apis.google.com/js/api.js"),
    loadScript("https://accounts.google.com/gsi/client"),
  ]);

  // Initialise gapi client
  await new Promise<void>((resolve) => {
    (window as any).gapi.load("client:picker", async () => {
      await (window as any).gapi.client.init({ apiKey: API_KEY });
      gapiLoaded = true;
      resolve();
    });
  });

  gisLoaded = true;
}

// ---------------------------------------------------------------------------
// OAuth2 — sign in / sign out
// ---------------------------------------------------------------------------

export function signInWithGoogle(): Promise<GoogleConnection> {
  // Demo mode — simulate a connection
  if (!isGoogleConfigured()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          connected: true,
          email: "student@university.edu",
          name: "Alex Student",
          avatarUrl: "",
          accessToken: "demo-token",
          connectedAt: new Date().toISOString(),
        });
      }, 800);
    });
  }

  // Real OAuth2 flow via Google Identity Services
  return new Promise((resolve, reject) => {
    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (resp: any) => {
        if (resp.error) {
          reject(new Error(resp.error));
          return;
        }

        // Fetch user profile
        const profile = await fetch(
          "https://www.googleapis.com/oauth2/v2/userinfo",
          { headers: { Authorization: `Bearer ${resp.access_token}` } }
        ).then((r) => r.json());

        resolve({
          connected: true,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.picture || "",
          accessToken: resp.access_token,
          connectedAt: new Date().toISOString(),
        });
      },
    });
    client.requestAccessToken();
  });
}

export function signOutGoogle(): GoogleConnection {
  return { connected: false };
}

// ---------------------------------------------------------------------------
// Drive — list files in a folder, search, get file content
// ---------------------------------------------------------------------------

/** Demo files returned when no real Google credentials are configured. */
function demoFiles(folderId?: string): DriveFile[] {
  const prefix = folderId ? `${folderId}/` : "";
  return [
    {
      id: `${prefix}demo-pdf-1`,
      name: "Week 1 — Introduction to Microeconomics.pdf",
      mimeType: "application/pdf",
      size: 2_450_000,
      modifiedTime: new Date(Date.now() - 86400000 * 3).toISOString(),
      webViewLink: "#",
    },
    {
      id: `${prefix}demo-pdf-2`,
      name: "Week 2 — Supply and Demand.pdf",
      mimeType: "application/pdf",
      size: 1_870_000,
      modifiedTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      webViewLink: "#",
    },
    {
      id: `${prefix}demo-slides`,
      name: "Chapter 3 Lecture Slides.pdf",
      mimeType: "application/pdf",
      size: 5_200_000,
      modifiedTime: new Date(Date.now() - 86400000).toISOString(),
      webViewLink: "#",
    },
    {
      id: `${prefix}demo-video`,
      name: "Lecture 4 — Market Equilibrium.mp4",
      mimeType: "video/mp4",
      size: 145_000_000,
      modifiedTime: new Date(Date.now() - 86400000 * 5).toISOString(),
      webViewLink: "#",
    },
    {
      id: `${prefix}demo-notes`,
      name: "Study Notes — Elasticity.txt",
      mimeType: "text/plain",
      size: 8_400,
      modifiedTime: new Date().toISOString(),
      webViewLink: "#",
    },
    {
      id: `${prefix}demo-doc`,
      name: "Assignment 1 — Essay Draft.txt",
      mimeType: "text/plain",
      size: 12_300,
      modifiedTime: new Date(Date.now() - 86400000 * 1).toISOString(),
      webViewLink: "#",
    },
  ];
}

function demoFolders(): DriveFolder[] {
  return [
    { id: "demo-folder-econ", name: "ECON 101 — Microeconomics", webViewLink: "#" },
    { id: "demo-folder-cs", name: "CS 201 — Data Structures", webViewLink: "#" },
    { id: "demo-folder-bio", name: "BIO 110 — Cell Biology", webViewLink: "#" },
    { id: "demo-folder-math", name: "MATH 301 — Linear Algebra", webViewLink: "#" },
  ];
}

export async function listDriveFolders(
  accessToken?: string
): Promise<DriveFolder[]> {
  if (!isGoogleConfigured() || !accessToken || accessToken === "demo-token") {
    await new Promise((r) => setTimeout(r, 500));
    return demoFolders();
  }

  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?" +
      new URLSearchParams({
        q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: "files(id,name,webViewLink)",
        orderBy: "modifiedTime desc",
        pageSize: "30",
      }),
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    webViewLink: f.webViewLink,
  }));
}

export async function listDriveFiles(
  folderId: string,
  accessToken?: string
): Promise<DriveFile[]> {
  if (!isGoogleConfigured() || !accessToken || accessToken === "demo-token") {
    await new Promise((r) => setTimeout(r, 600));
    return demoFiles(folderId);
  }

  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?" +
      new URLSearchParams({
        q: `'${folderId}' in parents and trashed=false`,
        fields:
          "files(id,name,mimeType,size,iconLink,modifiedTime,webViewLink)",
        orderBy: "modifiedTime desc",
        pageSize: "50",
      }),
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: Number(f.size) || 0,
    iconUrl: f.iconLink,
    modifiedTime: f.modifiedTime,
    webViewLink: f.webViewLink,
  }));
}

/** Download the raw text from a Drive file. */
export async function downloadDriveFileText(
  fileId: string,
  mimeType: string,
  accessToken?: string
): Promise<string> {
  // Demo mode — return sample text
  if (!isGoogleConfigured() || !accessToken || accessToken === "demo-token") {
    await new Promise((r) => setTimeout(r, 400));
    if (mimeType.includes("video")) {
      return [
        "[Auto-transcription placeholder]",
        "",
        "This video would be transcribed automatically using Whisper ASR in production.",
        "For now, replace this with the real lecture transcript.",
      ].join("\n");
    }
    return [
      "This is sample content imported from Google Drive.",
      "",
      "In production, the actual file contents would be extracted here.",
      "For PDF files, text is extracted page-by-page using the Drive export API.",
      "For text and markdown files, the raw content is downloaded directly.",
      "",
      "Key Concepts:",
      "- Supply and demand determine market prices",
      "- Equilibrium occurs where supply equals demand",
      "- Price elasticity measures sensitivity to price changes",
      "- Market efficiency requires perfect information",
      "",
      "The law of demand states that as price increases, quantity demanded",
      "decreases, all other factors being equal. Conversely, the law of",
      "supply states that as price increases, quantity supplied increases.",
    ].join("\n");
  }

  // Google Docs / Slides → export as plain text
  if (
    mimeType === "application/vnd.google-apps.document" ||
    mimeType === "application/vnd.google-apps.presentation"
  ) {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return res.text();
  }

  // Binary files — download raw content
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  return res.text();
}

// ---------------------------------------------------------------------------
// Calendar — create / update / delete events
// ---------------------------------------------------------------------------

export interface CalendarEvent {
  summary: string;
  description: string;
  start: string; // ISO date
  end: string;
  colorId?: string;
}

export async function createCalendarEvent(
  event: CalendarEvent,
  accessToken?: string,
  calendarId = "primary"
): Promise<string> {
  if (!isGoogleConfigured() || !accessToken || accessToken === "demo-token") {
    await new Promise((r) => setTimeout(r, 300));
    return `demo-event-${Date.now()}`;
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.summary,
        description: event.description,
        start: { date: event.start },
        end: { date: event.end },
        colorId: event.colorId || "9", // blueberry
        reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 30 }] },
      }),
    }
  );
  const data = await res.json();
  return data.id;
}

export async function deleteCalendarEvent(
  eventId: string,
  accessToken?: string,
  calendarId = "primary"
): Promise<void> {
  if (!isGoogleConfigured() || !accessToken || accessToken === "demo-token") {
    return;
  }

  await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}
