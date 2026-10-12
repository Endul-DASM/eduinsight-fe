import { cache } from "react";
import { ApiError, apiFetch, isMockMode } from "./client";
import type { AssessmentStatus, AssessmentType, LearningObjectiveRef, QuestionType } from "./types";

// Hasil Assessment (PRD 5.4.4, SRS FR-G-070 – 073). Scores are 0–100 with two decimals.

// final: the counted attempt has a final score. grading_pending: an answered essay waits for the teacher.
export type ResultStatus = "final" | "grading_pending" | "not_attempted";

export type ClassPerformance = {
  enrolled: number;
  submitted: number;
  gradingPending: number;
  notAttempted: number;
  // Averages and mastery count only students with a final score.
  average: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  masteredCount: number;
  masteryRate: number | null;
  // Ten bins, 0–9 … 90–100.
  distribution: { from: number; to: number; count: number }[];
};

export type QuestionPerformance = {
  questionId: string;
  number: number;
  type: QuestionType;
  stem: string;
  learningObjectives: LearningObjectiveRef[];
  responseCount: number;
  // Mean item score / 100; for pilihan ganda the proportion correct.
  pValue: number | null;
  // Pilihan ganda only.
  correctCount: number | null;
  options: { key: string; text: string; isKey: boolean; misconceptionTag: string | null; count: number }[] | null;
  unanswered: number;
  // Uraian only.
  gradedCount: number | null;
  pendingCount: number | null;
};

export type ObjectivePerformance = {
  learningObjective: LearningObjectiveRef;
  chapterNumber: number;
  chapterName: string;
  itemCount: number;
  // BR-05: fewer than 3 items.
  limitedData: boolean;
  questionNumbers: number[];
  classAverage: number | null;
};

export type StudentPerformance = {
  student: { id: string; name: string; username: string; nis: string | null };
  status: ResultStatus;
  attemptId: string | null;
  attemptNumber: number | null;
  attemptsUsed: number;
  score: number | null;
  // Null until the score is final.
  mastered: boolean | null;
  items: { questionId: string; score: number | null; isCorrect: boolean | null; answer: string | null }[];
  // BR-03; null while one of the TP's items is not graded.
  learningObjectives: { learningObjectiveId: string; score: number | null }[];
};

export type AssessmentResults = {
  assessment: {
    id: string;
    title: string;
    type: AssessmentType;
    status: AssessmentStatus;
    kkm: number;
    questionCount: number;
  };
  classPerformance: ClassPerformance;
  questions: QuestionPerformance[];
  learningObjectives: ObjectivePerformance[];
  students: StudentPerformance[];
};

// GET /assessments/:id/results — all four views in one payload. Null in mock mode, and when the backend has no
// results endpoint (404), so the page can say so instead of failing.
export const getAssessmentResults = cache(async (assessmentId: string): Promise<AssessmentResults | null> => {
  if (isMockMode) return null;
  try {
    return await apiFetch<AssessmentResults>(`/assessments/${encodeURIComponent(assessmentId)}/results`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) return null;
    throw error;
  }
});
