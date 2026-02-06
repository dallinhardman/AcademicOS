import { Summary, Quiz, QuizQuestion } from "@/types";
import { generateId } from "./id";

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateDistractors(correctAnswer: string, allDefinitions: string[]): string[] {
  const distractors = allDefinitions
    .filter((d) => d !== correctAnswer)
    .slice(0, 3);

  const fallbacks = [
    "None of the above",
    "All of the above",
    "This concept is not covered in the material",
  ];

  while (distractors.length < 3) {
    distractors.push(fallbacks[distractors.length] || `Option ${distractors.length + 1}`);
  }

  return distractors;
}

function createMCQsFromDefinitions(summary: Summary): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  const allDefs = summary.keyDefinitions.map((d) => d.definition);

  for (const def of summary.keyDefinitions) {
    const distractors = generateDistractors(def.definition, allDefs);
    const options = shuffleArray([def.definition, ...distractors]);

    questions.push({
      id: generateId(),
      type: "mcq",
      question: `What is the definition of "${def.term}"?`,
      options,
      correctAnswer: def.definition,
      explanation: `${def.term}: ${def.definition}`,
    });
  }

  return questions;
}

function createMCQsFromSections(summary: Summary): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  for (const section of summary.detailedBreakdown) {
    const sentences = section.content
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 20);

    if (sentences.length < 2) continue;

    // Create a "which section covers X" style question
    const keySentence = sentences[0];
    if (keySentence.length > 15) {
      const allHeadings = summary.detailedBreakdown.map((s) => s.heading);
      const distractors = allHeadings
        .filter((h) => h !== section.heading)
        .slice(0, 3);

      while (distractors.length < 3) {
        distractors.push(`Supplementary Topic ${distractors.length + 1}`);
      }

      const options = shuffleArray([section.heading, ...distractors]);

      questions.push({
        id: generateId(),
        type: "mcq",
        question: `Which section covers the following concept: "${keySentence.slice(0, 100)}${keySentence.length > 100 ? "..." : ""}"?`,
        options,
        correctAnswer: section.heading,
        explanation: `This concept is covered in the "${section.heading}" section.`,
      });
    }
  }

  return questions;
}

function createFlashcards(summary: Summary): QuizQuestion[] {
  const cards: QuizQuestion[] = [];

  // Flashcards from definitions
  for (const def of summary.keyDefinitions) {
    cards.push({
      id: generateId(),
      type: "flashcard",
      question: `Define: ${def.term}`,
      correctAnswer: def.definition,
      explanation: `${def.term}: ${def.definition}`,
    });
  }

  // Flashcards from executive summary
  for (let i = 0; i < summary.executiveSummary.length; i++) {
    const bullet = summary.executiveSummary[i];
    cards.push({
      id: generateId(),
      type: "flashcard",
      question: `What is key takeaway #${i + 1} from this lecture?`,
      correctAnswer: bullet,
      explanation: bullet,
    });
  }

  return cards;
}

export function generateQuiz(summary: Summary, unitId: string): Quiz {
  const defQuestions = createMCQsFromDefinitions(summary);
  const sectionQuestions = createMCQsFromSections(summary);
  const flashcards = createFlashcards(summary);

  // Mix: prioritize definition MCQs, add section MCQs, then flashcards
  const allQuestions = [...defQuestions, ...sectionQuestions, ...flashcards];

  // Cap at 10 questions for a good quiz experience
  const selected = allQuestions.slice(0, 10);

  return {
    id: generateId(),
    unitId,
    summaryId: summary.id,
    title: `Quiz: ${summary.title.replace(" - Study Guide", "")}`,
    questions: selected,
    createdAt: new Date().toISOString(),
  };
}
