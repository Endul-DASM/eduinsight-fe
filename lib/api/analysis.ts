import { cache } from "react";
import { ApiError, apiFetch, isMockMode } from "./client";
import type { AssessmentStatus, AssessmentType, LearningObjectiveRef, QuestionType } from "./types";

// Analisis Soal (PRD 5.5.2, SRS FR-G-090 – 093). Indices and coefficients come rounded to two decimals.

export type ItemDifficulty = "mudah" | "sedang" | "sulit";
export type ItemValidity = "sesuai" | "perlu_ditinjau";
export type ItemLabel = "baik" | "revisi" | "perlu_ditinjau";
// A metric outside its threshold: difficulty (Mudah or Sulit), validity (r < 0,30) or reliability (the assessment is
// more reliable without the item).
export type ItemIssue = "difficulty" | "validity" | "reliability";

export type AnalysisSummary = {
  itemCount: number;
  // Students with a final score; their attempts form the data.
  analyzedStudents: number;
  // Left out until their essays are graded.
  gradingPending: number;
  averagePValue: number | null;
  averageDifficulty: ItemDifficulty | null;
  // Items labelled Revisi or Perlu Ditinjau.
  problemCount: number;
  labelCounts: { baik: number; revisi: number; perluDitinjau: number };
  // FR-G-092. Null with fewer than 2 students or items, or when every student has the same total.
  reliability: { value: number; method: "kr20" | "cronbach"; reliable: boolean } | null;
};

export type ItemAnalysis = {
  questionId: string;
  number: number;
  type: QuestionType;
  stem: string;
  learningObjectives: LearningObjectiveRef[];
  pValue: number | null;
  difficulty: ItemDifficulty | null;
  // Against the other items of the same TP; null when no other item shares a TP or the scores do not vary.
  pointBiserial: number | null;
  validity: ItemValidity | null;
  alphaIfDeleted: number | null;
  issues: ItemIssue[];
  // Null until a student has a final score.
  label: ItemLabel | null;
  options: { key: string; text: string; isKey: boolean; misconceptionTag: string | null; count: number }[] | null;
  unanswered: number;
};

export type AssessmentAnalysis = {
  assessment: { id: string; title: string; type: AssessmentType; status: AssessmentStatus; kkm: number; questionCount: number };
  summary: AnalysisSummary;
  items: ItemAnalysis[];
};

// GET /assessments/:id/analysis — null in mock mode or when the assessment is gone.
export const getAssessmentAnalysis = cache(async (assessmentId: string): Promise<AssessmentAnalysis | null> => {
  if (isMockMode) return null;
  try {
    return await apiFetch<AssessmentAnalysis>(`/assessments/${encodeURIComponent(assessmentId)}/analysis`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) return null;
    throw error;
  }
});
