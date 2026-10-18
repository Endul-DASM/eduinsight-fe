import { cache } from "react";
import { ApiError, apiFetch, isMockMode } from "./client";
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
