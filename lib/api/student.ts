import { cache } from "react";
import { ApiError, apiFetch, isMockMode } from "./client";
import type { DiagnosisAssessment } from "./diagnosis";
import type { AssessmentMode, AssessmentStatus, AssessmentType, LearningObjectiveRef } from "./types";

// Sisi Siswa (PRD 6.1, SRS FR-S-001 – 004, 032): only the student's own data plus class averages. Scores are 0–100
// with two decimals.

export type StudentLabel = "sb" | "b" | "c" | "k";

// Level Penguasaan per Bab against the class average.
export type StudentChapter = {
  chapterId: string;
  number: number;
  name: string;
  score: number | null;
  label: StudentLabel | null;
  classAverage: number | null;
};

// A published assessment in the student's list, with their own attempts.
export type StudentAssessment = {
  id: string;
  title: string;
  type: AssessmentType;
  mode: AssessmentMode;
  status: AssessmentStatus;
  opensAt: string;
  closesAt: string;
  durationMinutes: number | null;
  maxAttempts: number;
  questionCount: number;
  learningObjectives: LearningObjectiveRef[];
  attemptsUsed: number;
  openAttemptId: string | null;
  bestScore: number | null;
  canStart: boolean;
};

export type MyMaterial = {
  id: string;
  title: string;
  format: "pdf" | "docx" | "pptx";
  sizeBytes: number;
  createdAt: string;
  // Part of the student's approved remedial package (FR-S-032).
  recommended: boolean;
  // The student's weak TPs the material covers.
  recommendedFor: LearningObjectiveRef[];
};

export type ActivityStatus = "menunggu_nilai" | "tuntas" | "belum_tuntas";

export type MyActivity = {
  kind: "assessment" | "material";
  at: string;
  assessment: { id: string; title: string; type: AssessmentType } | null;
  attemptId: string | null;
  score: number | null;
  status: ActivityStatus | null;
  material: { id: string; title: string } | null;
};

export type MyDashboard = {
  // Assessments with a submitted attempt.
  completedAssessments: number;
  // TPs labelled SB or B, of those with a score, of all TPs in scope.
  masteredObjectives: number;
  scoredObjectives: number;
  totalObjectives: number;
  // Remedials of this subject not tuntas yet.
  activeRemedials: number;
  chapters: StudentChapter[];
  // Scheduled or ongoing, by opening time.
  upcoming: StudentAssessment[];
  recommendedMaterials: MyMaterial[];
  // Newest first, at most 10.
  recentActivity: MyActivity[];
};

// GET /subjects/:id/my-dashboard — Performance Overview, Upcoming Test, Total Remed and Recent Activity.
export const getMyDashboard = cache(async (subjectId: string): Promise<MyDashboard | null> => {
  if (isMockMode) return null;
  try {
    return await apiFetch<MyDashboard>(`/subjects/${encodeURIComponent(subjectId)}/my-dashboard`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) return null;
    throw error;
  }
});

// GET /subjects/:id/my-assessments — published assessments of the subject, with the student's own attempts
// (FR-G-051, FR-G-105: official remedials only for students who need them).
export const getMyAssessments = cache(async (subjectId: string): Promise<StudentAssessment[]> => {
  if (isMockMode) return [];
  return apiFetch<StudentAssessment[]>(`/subjects/${encodeURIComponent(subjectId)}/my-assessments`);
});

// Taking an assessment (FR-S-010 – 013). The questions never carry the answer key.
export type AttemptQuestion = {
  id: string;
  // Position in the assessment, starting at 1.
  number: number;
  type: "pg" | "uraian";
  stem: string;
  options: { key: string; text: string }[] | null;
};

export type AttemptAnswer = { questionId: string; answer: string | null; answeredAt: string | null; isCorrect: boolean | null };

export type Attempt = {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  number: number;
  status: "in_progress" | "submitted";
  startedAt: string;
  deadlineAt: string;
  // Lets the timer run on server time.
  serverNow: string;
  submittedAt: string | null;
  autoSubmitted: boolean;
  questions: AttemptQuestion[];
  responses: AttemptAnswer[];
  // Set once submitted; score stays null while essays wait for the teacher.
  score: number | null;
  pgCorrect: number | null;
  pgTotal: number | null;
  essaysPending: number | null;
};

// GET /attempts/:id — null when it is not the student's.
export const getAttempt = cache(async (attemptId: string): Promise<Attempt | null> => {
  if (isMockMode) return null;
  try {
    return await apiFetch<Attempt>(`/attempts/${encodeURIComponent(attemptId)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

// Diagnosis Belajar (FR-S-040, 042): the student's TP scores against the class average. Items carry no answer,
// correctness or misconception tag.
export type MyDiagnosisItem = { assessmentId: string; assessmentTitle: string; number: number; score: number };

export type MyObjectiveDiagnosis = {
  learningObjective: LearningObjectiveRef;
  chapterNumber: number;
  chapterName: string;
  // BR-05: fewer than 3 items.
  limitedData: boolean;
  score: number | null;
  label: StudentLabel | null;
  classAverage: number | null;
  items: MyDiagnosisItem[];
};

export type MyDiagnosis = {
  assessments: DiagnosisAssessment[];
  // BR-04 lower bounds; below c is Kurang.
  thresholds: { sb: number; b: number; c: number };
  learningObjectives: MyObjectiveDiagnosis[];
  chapters: { chapterId: string; number: number; name: string; score: number | null; label: StudentLabel | null }[];
  // TP ids with the highest and lowest score; null without scores.
  strongest: string | null;
  weakest: string | null;
};

// GET /subjects/:id/my-diagnosis — every assessment in scope (no semester filter in the design).
export const getMyDiagnosis = cache(async (subjectId: string): Promise<MyDiagnosis | null> => {
  if (isMockMode) return null;
  try {
    return await apiFetch<MyDiagnosis>(`/subjects/${encodeURIComponent(subjectId)}/my-diagnosis`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) return null;
    throw error;
  }
});
