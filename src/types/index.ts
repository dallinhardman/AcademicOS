// ============================================
// AcademicOS Type Definitions
// ============================================

export interface Semester {
  id: string;
  name: string;
  createdAt: string;
}

export interface Unit {
  id: string;
  semesterId: string;
  name: string;
  subject: string;
  createdAt: string;
}

export interface Content {
  id: string;
  unitId: string;
  type: "pdf" | "video" | "youtube" | "text";
  title: string;
  url?: string;
  rawText: string;
  status: "processing" | "ready" | "error";
  createdAt: string;
}

export interface Definition {
  term: string;
  definition: string;
}

export interface SummarySection {
  heading: string;
  content: string;
}

export interface Summary {
  id: string;
  unitId: string;
  contentIds: string[];
  title: string;
  executiveSummary: string[];
  keyDefinitions: Definition[];
  detailedBreakdown: SummarySection[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: "mcq" | "flashcard";
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Quiz {
  id: string;
  unitId: string;
  summaryId: string;
  title: string;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  confidence: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  unitId: string;
  answers: QuizAnswer[];
  score: number;
  confidenceScore: number;
  completedAt: string;
}

export interface ScheduleItem {
  id: string;
  unitId: string;
  quizId: string;
  unitName: string;
  nextReviewDate: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lastScore: number;
  status: "due" | "upcoming" | "completed";
}

export interface AppState {
  semesters: Semester[];
  units: Unit[];
  contents: Content[];
  summaries: Summary[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  scheduleItems: ScheduleItem[];
}
