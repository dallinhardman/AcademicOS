"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import {
  AppState,
  Semester,
  Unit,
  Content,
  Summary,
  Quiz,
  QuizAttempt,
  ScheduleItem,
  GoogleConnection,
  LinkedDriveFolder,
  DriveFolder,
  CalendarSyncStatus,
} from "@/types";
import {
  sampleSemesters,
  sampleUnits,
  sampleContents,
  sampleSummaries,
  sampleQuizzes,
  sampleScheduleItems,
} from "@/lib/sample-data";
import { generateId } from "@/lib/id";
import { generateSummary } from "@/lib/summarizer";
import { generateQuiz } from "@/lib/quiz-generator";
import { createOrUpdateScheduleItem, getItemStatus } from "@/lib/scheduler";

const STORAGE_KEY = "academicos-state";

const initialState: AppState = {
  semesters: sampleSemesters,
  units: sampleUnits,
  contents: sampleContents,
  summaries: sampleSummaries,
  quizzes: sampleQuizzes,
  quizAttempts: [],
  scheduleItems: sampleScheduleItems,
  googleConnection: { connected: false },
  linkedDriveFolders: [],
  calendarSync: { enabled: false, syncedEventIds: {} },
};

type Action =
  | { type: "LOAD_STATE"; payload: AppState }
  | { type: "ADD_SEMESTER"; payload: Semester }
  | { type: "UPDATE_SEMESTER"; payload: Semester }
  | { type: "DELETE_SEMESTER"; payload: string }
  | { type: "ADD_UNIT"; payload: Unit }
  | { type: "UPDATE_UNIT"; payload: Unit }
  | { type: "DELETE_UNIT"; payload: string }
  | { type: "ADD_CONTENT"; payload: Content }
  | { type: "UPDATE_CONTENT"; payload: Content }
  | { type: "DELETE_CONTENT"; payload: string }
  | { type: "ADD_SUMMARY"; payload: Summary }
  | { type: "DELETE_SUMMARY"; payload: string }
  | { type: "ADD_QUIZ"; payload: Quiz }
  | { type: "DELETE_QUIZ"; payload: string }
  | { type: "ADD_QUIZ_ATTEMPT"; payload: QuizAttempt }
  | { type: "SET_SCHEDULE_ITEM"; payload: ScheduleItem }
  | { type: "REMOVE_SCHEDULE_ITEM"; payload: string }
  | { type: "SET_GOOGLE_CONNECTION"; payload: GoogleConnection }
  | { type: "LINK_DRIVE_FOLDER"; payload: LinkedDriveFolder }
  | { type: "UNLINK_DRIVE_FOLDER"; payload: string } // unitId
  | { type: "UPDATE_DRIVE_FOLDER_SYNC"; payload: { unitId: string; lastSyncedAt: string } }
  | { type: "SET_CALENDAR_SYNC"; payload: CalendarSyncStatus };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload;
    case "ADD_SEMESTER":
      return { ...state, semesters: [...state.semesters, action.payload] };
    case "UPDATE_SEMESTER":
      return {
        ...state,
        semesters: state.semesters.map((s) =>
          s.id === action.payload.id ? action.payload : s
        ),
      };
    case "DELETE_SEMESTER":
      return {
        ...state,
        semesters: state.semesters.filter((s) => s.id !== action.payload),
        units: state.units.filter((u) => u.semesterId !== action.payload),
      };
    case "ADD_UNIT":
      return { ...state, units: [...state.units, action.payload] };
    case "UPDATE_UNIT":
      return {
        ...state,
        units: state.units.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      };
    case "DELETE_UNIT":
      return {
        ...state,
        units: state.units.filter((u) => u.id !== action.payload),
        contents: state.contents.filter((c) => c.unitId !== action.payload),
        summaries: state.summaries.filter((s) => s.unitId !== action.payload),
      };
    case "ADD_CONTENT":
      return { ...state, contents: [...state.contents, action.payload] };
    case "UPDATE_CONTENT":
      return {
        ...state,
        contents: state.contents.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "DELETE_CONTENT":
      return { ...state, contents: state.contents.filter((c) => c.id !== action.payload) };
    case "ADD_SUMMARY":
      return { ...state, summaries: [...state.summaries, action.payload] };
    case "DELETE_SUMMARY":
      return { ...state, summaries: state.summaries.filter((s) => s.id !== action.payload) };
    case "ADD_QUIZ":
      return { ...state, quizzes: [...state.quizzes, action.payload] };
    case "DELETE_QUIZ":
      return { ...state, quizzes: state.quizzes.filter((q) => q.id !== action.payload) };
    case "ADD_QUIZ_ATTEMPT":
      return { ...state, quizAttempts: [...state.quizAttempts, action.payload] };
    case "SET_SCHEDULE_ITEM": {
      const existing = state.scheduleItems.find((s) => s.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          scheduleItems: state.scheduleItems.map((s) =>
            s.id === action.payload.id ? action.payload : s
          ),
        };
      }
      return { ...state, scheduleItems: [...state.scheduleItems, action.payload] };
    }
    case "REMOVE_SCHEDULE_ITEM":
      return {
        ...state,
        scheduleItems: state.scheduleItems.filter((s) => s.id !== action.payload),
      };
    case "SET_GOOGLE_CONNECTION":
      return { ...state, googleConnection: action.payload };
    case "LINK_DRIVE_FOLDER": {
      const filtered = state.linkedDriveFolders.filter(
        (l) => l.unitId !== action.payload.unitId
      );
      return { ...state, linkedDriveFolders: [...filtered, action.payload] };
    }
    case "UNLINK_DRIVE_FOLDER":
      return {
        ...state,
        linkedDriveFolders: state.linkedDriveFolders.filter(
          (l) => l.unitId !== action.payload
        ),
      };
    case "UPDATE_DRIVE_FOLDER_SYNC":
      return {
        ...state,
        linkedDriveFolders: state.linkedDriveFolders.map((l) =>
          l.unitId === action.payload.unitId
            ? { ...l, lastSyncedAt: action.payload.lastSyncedAt }
            : l
        ),
      };
    case "SET_CALENDAR_SYNC":
      return { ...state, calendarSync: action.payload };
    default:
      return state;
  }
}

interface AcademicContextType {
  state: AppState;
  // Semester actions
  addSemester: (name: string) => Semester;
  updateSemester: (semester: Semester) => void;
  deleteSemester: (id: string) => void;
  // Unit actions
  addUnit: (semesterId: string, name: string, subject: string) => Unit;
  updateUnit: (unit: Unit) => void;
  deleteUnit: (id: string) => void;
  // Content actions
  addContent: (unitId: string, type: Content["type"], title: string, rawText: string, url?: string) => Content;
  deleteContent: (id: string) => void;
  // Summary actions
  generateSummaryForUnit: (unitId: string) => Summary | null;
  deleteSummary: (id: string) => void;
  // Quiz actions
  generateQuizForSummary: (summaryId: string) => Quiz | null;
  deleteQuiz: (id: string) => void;
  // Quiz attempt actions
  submitQuizAttempt: (attempt: QuizAttempt) => void;
  // Helpers
  getUnitsForSemester: (semesterId: string) => Unit[];
  getContentsForUnit: (unitId: string) => Content[];
  getSummariesForUnit: (unitId: string) => Summary[];
  getQuizzesForUnit: (unitId: string) => Quiz[];
  getAttemptsForQuiz: (quizId: string) => QuizAttempt[];
  getDueScheduleItems: () => ScheduleItem[];
  getUpcomingScheduleItems: () => ScheduleItem[];
  // Google Workspace actions
  setGoogleConnection: (connection: GoogleConnection) => void;
  linkDriveFolder: (unitId: string, folder: DriveFolder) => void;
  unlinkDriveFolder: (unitId: string) => void;
  updateDriveFolderSync: (unitId: string) => void;
  getLinkedFolder: (unitId: string) => LinkedDriveFolder | undefined;
  setCalendarSync: (sync: CalendarSyncStatus) => void;
}

const AcademicContext = createContext<AcademicContextType | null>(null);

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new Google fields exist for backward compat with old localStorage
        if (!parsed.googleConnection) parsed.googleConnection = { connected: false };
        if (!parsed.linkedDriveFolders) parsed.linkedDriveFolders = [];
        if (!parsed.calendarSync) parsed.calendarSync = { enabled: false, syncedEventIds: {} };
        dispatch({ type: "LOAD_STATE", payload: parsed });
      }
    } catch {
      // Use initial state if localStorage fails
    }
  }, []);

  // Save to localStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Silently fail if storage is full
    }
  }, [state]);

  const addSemester = useCallback((name: string) => {
    const semester: Semester = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_SEMESTER", payload: semester });
    return semester;
  }, []);

  const updateSemester = useCallback((semester: Semester) => {
    dispatch({ type: "UPDATE_SEMESTER", payload: semester });
  }, []);

  const deleteSemester = useCallback((id: string) => {
    dispatch({ type: "DELETE_SEMESTER", payload: id });
  }, []);

  const addUnit = useCallback((semesterId: string, name: string, subject: string) => {
    const unit: Unit = {
      id: generateId(),
      semesterId,
      name,
      subject,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "ADD_UNIT", payload: unit });
    return unit;
  }, []);

  const updateUnit = useCallback((unit: Unit) => {
    dispatch({ type: "UPDATE_UNIT", payload: unit });
  }, []);

  const deleteUnit = useCallback((id: string) => {
    dispatch({ type: "DELETE_UNIT", payload: id });
  }, []);

  const addContent = useCallback(
    (unitId: string, type: Content["type"], title: string, rawText: string, url?: string) => {
      const content: Content = {
        id: generateId(),
        unitId,
        type,
        title,
        url,
        rawText,
        status: "ready",
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_CONTENT", payload: content });
      return content;
    },
    []
  );

  const deleteContent = useCallback((id: string) => {
    dispatch({ type: "DELETE_CONTENT", payload: id });
  }, []);

  const generateSummaryForUnit = useCallback(
    (unitId: string) => {
      const contents = state.contents.filter((c) => c.unitId === unitId && c.status === "ready");
      if (contents.length === 0) return null;

      const unit = state.units.find((u) => u.id === unitId);
      if (!unit) return null;

      const summary = generateSummary(
        unitId,
        contents.map((c) => c.id),
        unit.name,
        contents.map((c) => c.rawText)
      );

      dispatch({ type: "ADD_SUMMARY", payload: summary });
      return summary;
    },
    [state.contents, state.units]
  );

  const deleteSummary = useCallback((id: string) => {
    dispatch({ type: "DELETE_SUMMARY", payload: id });
  }, []);

  const generateQuizForSummary = useCallback(
    (summaryId: string) => {
      const summary = state.summaries.find((s) => s.id === summaryId);
      if (!summary) return null;

      const quiz = generateQuiz(summary, summary.unitId);
      dispatch({ type: "ADD_QUIZ", payload: quiz });
      return quiz;
    },
    [state.summaries]
  );

  const deleteQuiz = useCallback((id: string) => {
    dispatch({ type: "DELETE_QUIZ", payload: id });
  }, []);

  const submitQuizAttempt = useCallback(
    (attempt: QuizAttempt) => {
      dispatch({ type: "ADD_QUIZ_ATTEMPT", payload: attempt });

      // Update schedule using SM-2
      const unit = state.units.find((u) => u.id === attempt.unitId);
      const existing = state.scheduleItems.find(
        (s) => s.unitId === attempt.unitId && s.quizId === attempt.quizId
      );
      const updated = createOrUpdateScheduleItem(
        existing || null,
        attempt,
        unit?.name || "Unknown Unit"
      );
      dispatch({ type: "SET_SCHEDULE_ITEM", payload: updated });
    },
    [state.units, state.scheduleItems]
  );

  const getUnitsForSemester = useCallback(
    (semesterId: string) => state.units.filter((u) => u.semesterId === semesterId),
    [state.units]
  );

  const getContentsForUnit = useCallback(
    (unitId: string) => state.contents.filter((c) => c.unitId === unitId),
    [state.contents]
  );

  const getSummariesForUnit = useCallback(
    (unitId: string) => state.summaries.filter((s) => s.unitId === unitId),
    [state.summaries]
  );

  const getQuizzesForUnit = useCallback(
    (unitId: string) => state.quizzes.filter((q) => q.unitId === unitId),
    [state.quizzes]
  );

  const getAttemptsForQuiz = useCallback(
    (quizId: string) => state.quizAttempts.filter((a) => a.quizId === quizId),
    [state.quizAttempts]
  );

  const getDueScheduleItems = useCallback(
    () => state.scheduleItems.filter((s) => getItemStatus(s) === "due"),
    [state.scheduleItems]
  );

  const getUpcomingScheduleItems = useCallback(
    () => state.scheduleItems.filter((s) => getItemStatus(s) === "upcoming"),
    [state.scheduleItems]
  );

  // --- Google Workspace actions ---

  const setGoogleConnection = useCallback((connection: GoogleConnection) => {
    dispatch({ type: "SET_GOOGLE_CONNECTION", payload: connection });
  }, []);

  const linkDriveFolder = useCallback((unitId: string, folder: DriveFolder) => {
    const linked: LinkedDriveFolder = {
      unitId,
      folder,
      linkedAt: new Date().toISOString(),
    };
    dispatch({ type: "LINK_DRIVE_FOLDER", payload: linked });
  }, []);

  const unlinkDriveFolder = useCallback((unitId: string) => {
    dispatch({ type: "UNLINK_DRIVE_FOLDER", payload: unitId });
  }, []);

  const updateDriveFolderSync = useCallback((unitId: string) => {
    dispatch({
      type: "UPDATE_DRIVE_FOLDER_SYNC",
      payload: { unitId, lastSyncedAt: new Date().toISOString() },
    });
  }, []);

  const getLinkedFolder = useCallback(
    (unitId: string) => state.linkedDriveFolders.find((l) => l.unitId === unitId),
    [state.linkedDriveFolders]
  );

  const setCalendarSync = useCallback((sync: CalendarSyncStatus) => {
    dispatch({ type: "SET_CALENDAR_SYNC", payload: sync });
  }, []);

  const value: AcademicContextType = {
    state,
    addSemester,
    updateSemester,
    deleteSemester,
    addUnit,
    updateUnit,
    deleteUnit,
    addContent,
    deleteContent,
    generateSummaryForUnit,
    deleteSummary,
    generateQuizForSummary,
    deleteQuiz,
    submitQuizAttempt,
    getUnitsForSemester,
    getContentsForUnit,
    getSummariesForUnit,
    getQuizzesForUnit,
    getAttemptsForQuiz,
    getDueScheduleItems,
    getUpcomingScheduleItems,
    setGoogleConnection,
    linkDriveFolder,
    unlinkDriveFolder,
    updateDriveFolderSync,
    getLinkedFolder,
    setCalendarSync,
  };

  return (
    <AcademicContext.Provider value={value}>{children}</AcademicContext.Provider>
  );
}

export function useAcademic() {
  const ctx = useContext(AcademicContext);
  if (!ctx) throw new Error("useAcademic must be used within AcademicProvider");
  return ctx;
}
