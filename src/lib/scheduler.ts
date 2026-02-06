import { ScheduleItem, QuizAttempt } from "@/types";
import { generateId } from "./id";

/**
 * Modified SM-2 Spaced Repetition Algorithm
 *
 * Quality score (q) mapped from confidence (1-5):
 *   1 -> 0 (complete blackout)
 *   2 -> 1 (incorrect, but recognized)
 *   3 -> 3 (correct with difficulty)
 *   4 -> 4 (correct with hesitation)
 *   5 -> 5 (perfect recall)
 *
 * Rules:
 * - If q < 3: reset repetitions, interval = 1 day
 * - If q >= 3:
 *   - rep 1: interval = 1 day
 *   - rep 2: interval = 6 days
 *   - rep 3+: interval = prev_interval * EF
 * - EF adjustment: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
 * - EF minimum: 1.3
 *
 * Custom override per spec:
 * - Score < 3 -> Review in 24h (1 day)
 * - Score > 4 -> Review in 7 days (for early items)
 */

function mapConfidenceToQuality(confidence: number): number {
  const map: Record<number, number> = { 1: 0, 2: 1, 3: 3, 4: 4, 5: 5 };
  return map[Math.round(confidence)] ?? 3;
}

export function calculateNextReview(
  existing: ScheduleItem | null,
  attempt: QuizAttempt
): { interval: number; easeFactor: number; repetitions: number } {
  const q = mapConfidenceToQuality(attempt.confidenceScore);

  let ef = existing?.easeFactor ?? 2.5;
  let reps = existing?.repetitions ?? 0;
  let interval: number;

  if (q < 3) {
    // Failed - reset
    reps = 0;
    interval = 1;
  } else {
    reps++;
    if (reps === 1) {
      interval = 1;
    } else if (reps === 2) {
      interval = 6;
    } else {
      const prevInterval = existing?.interval ?? 6;
      interval = Math.round(prevInterval * ef);
    }
  }

  // Apply EF adjustment
  ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (ef < 1.3) ef = 1.3;

  // Custom spec overrides for early reviews
  if (attempt.confidenceScore < 3 && interval > 1) {
    interval = 1;
  }
  if (attempt.confidenceScore > 4 && reps <= 2) {
    interval = 7;
  }

  return { interval, easeFactor: ef, repetitions: reps };
}

export function createOrUpdateScheduleItem(
  existing: ScheduleItem | null,
  attempt: QuizAttempt,
  unitName: string
): ScheduleItem {
  const { interval, easeFactor, repetitions } = calculateNextReview(existing, attempt);

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    id: existing?.id ?? generateId(),
    unitId: attempt.unitId,
    quizId: attempt.quizId,
    unitName,
    nextReviewDate: nextReview.toISOString(),
    interval,
    easeFactor,
    repetitions,
    lastScore: attempt.confidenceScore,
    status: "upcoming",
  };
}

export function getItemStatus(item: ScheduleItem): "due" | "upcoming" | "completed" {
  const now = new Date();
  const reviewDate = new Date(item.nextReviewDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());

  if (reviewDay <= today) return "due";
  return "upcoming";
}

export function getDaysUntilReview(item: ScheduleItem): number {
  const now = new Date();
  const reviewDate = new Date(item.nextReviewDate);
  const diffMs = reviewDate.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
