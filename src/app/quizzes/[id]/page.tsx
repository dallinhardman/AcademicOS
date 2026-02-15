"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAcademic } from "@/context/AcademicContext";
import { QuizAnswer } from "@/types";
import { generateId } from "@/lib/id";

export default function QuizDetailPage() {
  const params = useParams();
  const quizId = params.id as string;
  const { state, submitQuizAttempt, getAttemptsForQuiz } = useAcademic();

  const quiz = state.quizzes.find((q) => q.id === quizId);
  const unit = quiz ? state.units.find((u) => u.id === quiz.unitId) : null;
  const attempts = getAttemptsForQuiz(quizId);

  const [mode, setMode] = useState<"overview" | "taking" | "results">("overview");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [confidence, setConfidence] = useState(3);

  if (!quiz) {
    return (
      <div className="p-8">
        <p className="text-slate-500">Quiz not found.</p>
        <Link href="/quizzes" className="text-academic-600 hover:text-academic-700 text-sm mt-2 inline-block">
          Back to quizzes
        </Link>
      </div>
    );
  }

  const question = quiz.questions[currentQ];

  const handleAnswer = () => {
    if (!question) return;

    let userAnswer = selectedOption || "";
    let correct = false;

    if (question.type === "mcq") {
      correct = userAnswer === question.correctAnswer;
    } else {
      correct = showAnswer;
      userAnswer = "(flashcard)";
    }

    const answer: QuizAnswer = {
      questionId: question.id,
      userAnswer,
      correct,
      confidence,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelectedOption(null);
      setShowAnswer(false);
      setConfidence(3);
    } else {
      // Submit quiz
      const correctCount = newAnswers.filter((a) => a.correct).length;
      const score = (correctCount / quiz.questions.length) * 100;
      const avgConfidence = newAnswers.reduce((acc, a) => acc + a.confidence, 0) / newAnswers.length;

      submitQuizAttempt({
        id: generateId(),
        quizId: quiz.id,
        unitId: quiz.unitId,
        answers: newAnswers,
        score,
        confidenceScore: avgConfidence,
        completedAt: new Date().toISOString(),
      });
      setMode("results");
    }
  };

  const startQuiz = () => {
    setMode("taking");
    setCurrentQ(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowAnswer(false);
    setConfidence(3);
  };

  // Results view
  if (mode === "results") {
    const lastAttempt = attempts[attempts.length - 1];
    const correctCount = answers.filter((a) => a.correct).length;
    return (
      <div className="p-8 max-w-3xl">
        <div className="mb-2">
          <Link href="/quizzes" className="text-sm text-slate-500 hover:text-slate-700">Quizzes</Link>
          <span className="text-sm text-slate-400 mx-2">/</span>
          <span className="text-sm text-slate-700">Results</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            lastAttempt && lastAttempt.score >= 80 ? "bg-emerald-100" :
            lastAttempt && lastAttempt.score >= 60 ? "bg-yellow-100" :
            "bg-red-100"
          }`}>
            <span className={`text-2xl font-bold ${
              lastAttempt && lastAttempt.score >= 80 ? "text-emerald-700" :
              lastAttempt && lastAttempt.score >= 60 ? "text-yellow-700" :
              "text-red-700"
            }`}>
              {lastAttempt ? Math.round(lastAttempt.score) : 0}%
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Quiz Complete!</h2>
          <p className="text-slate-600">
            You got {correctCount} out of {quiz.questions.length} correct.
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Average confidence: {lastAttempt ? lastAttempt.confidenceScore.toFixed(1) : "N/A"} / 5
          </p>
          <p className="text-sm text-academic-600 mt-3">
            Your review has been scheduled based on your performance.
          </p>
        </div>

        {/* Answer Review */}
        <div className="space-y-3 mb-6">
          {quiz.questions.map((q, i) => {
            const ans = answers[i];
            return (
              <div key={q.id} className={`bg-white border rounded-xl p-5 ${
                ans?.correct ? "border-emerald-200" : "border-red-200"
              }`}>
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    ans?.correct ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    {ans?.correct ? "\u2713" : "\u2717"}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{q.question}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      <span className="font-medium">Answer:</span> {q.correctAnswer}
                    </p>
                    {q.explanation && (
                      <p className="text-xs text-slate-500 mt-1">{q.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={startQuiz}
            className="px-4 py-2.5 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700"
          >
            Retake Quiz
          </button>
          <Link
            href="/schedule"
            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            View Schedule
          </Link>
        </div>
      </div>
    );
  }

  // Taking view
  if (mode === "taking" && question) {
    return (
      <div className="p-8 max-w-3xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-slate-500 mb-2">
            <span>Question {currentQ + 1} of {quiz.questions.length}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
              question.type === "mcq" ? "bg-purple-50 text-purple-700" : "bg-orange-50 text-orange-700"
            }`}>
              {question.type === "mcq" ? "Multiple Choice" : "Flashcard"}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-academic-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{question.question}</h2>

          {question.type === "mcq" && question.options && (
            <div className="space-y-2">
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                    selectedOption === opt
                      ? "border-academic-500 bg-academic-50 text-academic-800"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {question.type === "flashcard" && (
            <div>
              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-8 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-academic-400 hover:text-academic-600 transition-colors text-sm font-medium"
                >
                  Click to reveal answer
                </button>
              ) : (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-800 leading-relaxed">{question.correctAnswer}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confidence Rating */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <p className="text-sm font-medium text-slate-700 mb-3">
            How confident are you in your {question.type === "flashcard" ? "understanding" : "answer"}? (1-5)
          </p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setConfidence(n)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                  confidence === n
                    ? "bg-academic-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
            <span>No idea</span>
            <span>Perfect recall</span>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleAnswer}
          disabled={question.type === "mcq" && !selectedOption}
          className="w-full py-3 bg-academic-600 text-white rounded-lg text-sm font-medium hover:bg-academic-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQ < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </button>
      </div>
    );
  }

  // Overview
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-2">
        <Link href="/quizzes" className="text-sm text-slate-500 hover:text-slate-700">Quizzes</Link>
        <span className="text-sm text-slate-400 mx-2">/</span>
        <span className="text-sm text-slate-700">{quiz.title}</span>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{quiz.title}</h1>
            {unit && (
              <p className="text-sm text-slate-500">{unit.name}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{quiz.questions.length}</p>
            <p className="text-xs text-slate-500">Questions</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{quiz.questions.filter((q) => q.type === "mcq").length}</p>
            <p className="text-xs text-slate-500">MCQs</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{quiz.questions.filter((q) => q.type === "flashcard").length}</p>
            <p className="text-xs text-slate-500">Flashcards</p>
          </div>
        </div>

        <button
          onClick={startQuiz}
          className="w-full py-3 bg-academic-600 text-white rounded-lg text-sm font-semibold hover:bg-academic-700 transition-colors"
        >
          Start Quiz
        </button>
      </div>

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-900">Previous Attempts</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {attempts.slice().reverse().map((attempt, i) => (
              <div key={attempt.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-900">
                    Attempt #{attempts.length - i}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(attempt.completedAt).toLocaleDateString()} at{" "}
                    {new Date(attempt.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${
                    attempt.score >= 80 ? "text-emerald-600" :
                    attempt.score >= 60 ? "text-yellow-600" :
                    "text-red-600"
                  }`}>
                    {Math.round(attempt.score)}%
                  </span>
                  <span className="text-xs text-slate-400">
                    conf: {attempt.confidenceScore.toFixed(1)}/5
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
