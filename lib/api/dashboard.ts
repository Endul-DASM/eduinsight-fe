import { cache } from "react";
import {
  type AssessedAssessment,
  type AttemptItem,
  type AttemptSummary,
  bestAttempts,
  computeDashboard,
  type DashboardData,
  type EnrolledStudent,
} from "@/lib/dashboard/compute";
import { mockDashboard } from "@/lib/dashboard/mock";
import { getAssessment, getAssessments } from "./assessments";
import { apiFetch, isMockMode } from "./client";
import { getCurriculum } from "./curriculum";
import type { Subject } from "./types";

// GET /subjects/:id/students — the students who joined the subject.
export const getSubjectStudents = cache(async (subjectId: string) =>
  apiFetch<EnrolledStudent[]>(`/subjects/${encodeURIComponent(subjectId)}/students`),
);

// GET /assessments/:id/attempts — every attempt, newest first.
export const getAssessmentAttempts = cache(async (assessmentId: string) =>
  apiFetch<AttemptSummary[]>(`/assessments/${encodeURIComponent(assessmentId)}/attempts`),
);

// GET /assessments/:id/attempts/:attemptId — the attempt with its answers, scores and misconception tags.
export const getAttemptDetail = cache(async (assessmentId: string, attemptId: string) =>
  apiFetch<AttemptSummary & { items: AttemptItem[] }>(
    `/assessments/${encodeURIComponent(assessmentId)}/attempts/${encodeURIComponent(attemptId)}`,
  ),
);

// Everything the Dashboard Guru shows, computed from the backend's raw data. There is no dashboard endpoint yet, so
// this makes one request per published assessment and per student's best attempt.
export const getDashboard = cache(async (subject: Subject): Promise<DashboardData> => {
  if (isMockMode) return mockDashboard;

  const [students, assessments, curriculum] = await Promise.all([
    getSubjectStudents(subject.id),
    getAssessments(subject.id),
    getCurriculum(subject.id),
  ]);

  const assessed: AssessedAssessment[] = await Promise.all(
    assessments
      .filter((assessment) => assessment.publishedAt)
      .map(async (assessment) => {
        const [detail, attempts] = await Promise.all([getAssessment(assessment.id), getAssessmentAttempts(assessment.id)]);
        const questionObjectives = new Map(
          (detail?.questions ?? []).map((question) => [
            question.id,
            question.learningObjectives.map((objective) => objective.id),
          ]),
        );
        const details = await Promise.all(
          bestAttempts(attempts).map((attempt) => getAttemptDetail(assessment.id, attempt.id)),
        );
        return {
          assessment,
          questionObjectives,
          attempts,
          items: new Map(details.map((attempt) => [attempt.id, attempt.items])),
        };
      }),
  );

  return computeDashboard(students, assessed, curriculum, (id) => `/${subject.slug}/assessment/${id}`);
});
