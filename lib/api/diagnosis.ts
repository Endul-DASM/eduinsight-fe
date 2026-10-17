import { cache } from "react";
import { ApiError, apiFetch, isMockMode } from "./client";
import type { AssessmentType, LearningObjectiveRef } from "./types";

// Diagnosis TP and Bab, misconception patterns and drill-down (PRD 5.5.1, SRS FR-G-080 – 085, BR-03 – 06).
// Scores are 0–100 with two decimals; labels come from the unrounded score.

// BR-04: Sangat Baik, Baik, Cukup, Kurang.
export type ApiDiagnosisLabel = "sb" | "b" | "c" | "k";

export type DiagnosisAssessment = { id: string; title: string; type: AssessmentType; opensAt: string | null };

export type LabelCounts = { sb: number; b: number; c: number; k: number; noData: number };

export type ObjectiveDiagnosis = {
  learningObjective: LearningObjectiveRef;
  chapterNumber: number;
  chapterName: string;
  itemCount: number;
  // BR-05: fewer than 3 items.
  limitedData: boolean;
  classAverage: number | null;
  label: ApiDiagnosisLabel | null;
  labelCounts: LabelCounts;
};

export type ChapterDiagnosis = {
  chapterId: string;
  number: number;
  name: string;
  classAverage: number | null;
  label: ApiDiagnosisLabel | null;
  labelCounts: LabelCounts;
};

export type DiagnosisStudent = { id: string; name: string; username: string; nis: string | null };

export type StudentDiagnosisRow = {
  student: DiagnosisStudent;
  learningObjectives: { learningObjectiveId: string; score: number | null; label: ApiDiagnosisLabel | null }[];
  chapters: { chapterId: string; score: number | null; label: ApiDiagnosisLabel | null }[];
};

export type MisconceptionPattern = {
  // BR-06; rank 1 is the Akar Masalah card.
  rank: number;
  // Null for an untagged wrong option, which is a pattern of its own.
  tag: string | null;
  affectedCount: number;
  affectedPct: number;
  studentIds: string[];
  sources: { assessmentId: string; assessmentTitle: string; questionId: string; number: number; option: string | null }[];
};

export type ClassDiagnosis = {
  assessments: DiagnosisAssessment[];
  thresholds: { sb: number; b: number; c: number };
  analyzedStudents: number;
  learningObjectives: ObjectiveDiagnosis[];
  chapters: ChapterDiagnosis[];
  students: StudentDiagnosisRow[];
  misconceptions: MisconceptionPattern[];
};

export type DiagnosisItem = {
  assessmentId: string;
  assessmentTitle: string;
  questionId: string;
  number: number;
  score: number;
  isCorrect: boolean | null;
  answer: string | null;
  misconceptionTag: string | null;
};

export type StudentDiagnosis = {
  student: DiagnosisStudent;
  assessments: DiagnosisAssessment[];
  thresholds: { sb: number; b: number; c: number };
  learningObjectives: {
    learningObjective: LearningObjectiveRef;
    chapterNumber: number;
    chapterName: string;
    limitedData: boolean;
    score: number | null;
    label: ApiDiagnosisLabel | null;
    classAverage: number | null;
    items: DiagnosisItem[];
  }[];
  chapters: {
    chapterId: string;
    number: number;
    name: string;
    score: number | null;
    label: ApiDiagnosisLabel | null;
    classAverage: number | null;
  }[];
  // TP ids with the highest and lowest score.
  strongest: string | null;
  weakest: string | null;
};

// Without filters the backend takes every published post-test, UH, UTS and UAS (BR-07 scope).
export type DiagnosisFilters = { assessmentId?: string; semester?: "ganjil" | "genap"; chapterId?: string };

function filterQuery(filters: DiagnosisFilters) {
  const query = new URLSearchParams();
  if (filters.assessmentId) query.set("assessmentId", filters.assessmentId);
  if (filters.semester) query.set("semester", filters.semester);
  if (filters.chapterId) query.set("chapterId", filters.chapterId);
  return query.size ? `?${query}` : "";
}

async function orNull<T>(request: Promise<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 422)) return null;
    throw error;
  }
}

// GET /subjects/:id/diagnosis — Class Diagnosis, Diagnosis TP, Bab × label and misconception patterns.
export const getClassDiagnosis = cache(async (subjectId: string, filters: DiagnosisFilters): Promise<ClassDiagnosis | null> => {
  if (isMockMode) return null;
  return orNull(apiFetch<ClassDiagnosis>(`/subjects/${encodeURIComponent(subjectId)}/diagnosis${filterQuery(filters)}`));
});

// GET /subjects/:id/diagnosis/students/:studentId — Student Diagnosis with the drill-down to questions.
export const getStudentDiagnosis = cache(
  async (subjectId: string, studentId: string, filters: DiagnosisFilters): Promise<StudentDiagnosis | null> => {
    if (isMockMode) return null;
    return orNull(
      apiFetch<StudentDiagnosis>(
        `/subjects/${encodeURIComponent(subjectId)}/diagnosis/students/${encodeURIComponent(studentId)}${filterQuery(filters)}`,
      ),
    );
  },
);
