import { cache } from "react";
import {
  type Activity,
  type AttemptSummary,
  type ChapterDiagnosis,
  type DashboardData,
  type DiagnosisLabel,
  type LabelGroups,
} from "@/lib/dashboard/compute";
import { mockDashboard } from "@/lib/dashboard/mock";
import { apiFetch, isMockMode } from "./client";
import type { ApiDiagnosisLabel, LabelCounts, MisconceptionPattern } from "./diagnosis";
import type { LearningObjectiveRef, Subject } from "./types";

// GET /assessments/:id/attempts — every attempt, newest first.
export const getAssessmentAttempts = cache(async (assessmentId: string) =>
  apiFetch<AttemptSummary[]>(`/assessments/${encodeURIComponent(assessmentId)}/attempts`),
);

// GET /subjects/:id/dashboard (SRS FR-G-010 – 013, 015). Scores are 0–100 with two decimals.

type LabelStudents = Record<ApiDiagnosisLabel, { studentId: string; name: string; score: number }[]>;

type ApiActivity = {
  kind:
    | "assessment_published"
    | "assessment_closed"
    | "essays_pending"
    | "remedial_approved"
    | "material_uploaded"
    | "student_joined";
  at: string;
  title: string;
  targetId: string;
  count: number | null;
};

export type TeacherDashboard = {
  overview: {
    periodDays: number;
    averageScore: number | null;
    previousAverageScore: number | null;
    // averageScore minus previousAverageScore.
    trend: number | null;
    studentCount: number;
    assessedCount: number;
    // Students not tuntas yet, across every source assessment (FR-G-002).
    remedialStudentCount: number;
  };
  quickDiagnosis: {
    chapterId: string;
    number: number;
    name: string;
    labelCounts: LabelCounts;
    students: LabelStudents;
    learningObjectives: {
      learningObjective: LearningObjectiveRef;
      itemCount: number;
      labelCounts: LabelCounts;
      students: LabelStudents;
    }[];
  }[];
  topMisconceptions: MisconceptionPattern[];
  recentActivity: ApiActivity[];
};

const labels: Record<ApiDiagnosisLabel, DiagnosisLabel> = { sb: "SB", b: "B", c: "C", k: "K" };

function groups(students: LabelStudents): LabelGroups {
  return Object.fromEntries(
    (Object.keys(labels) as ApiDiagnosisLabel[]).map((label) => [labels[label], students[label]]),
  ) as LabelGroups;
}

// One line per backend entry, in the Aktivitas Terbaru wording.
function activityOf(entry: ApiActivity, slug: string): Activity {
  const id = `${entry.kind}-${entry.targetId}-${entry.at}`;
  const assessment = `/${slug}/assessment/${entry.targetId}`;
  switch (entry.kind) {
    case "assessment_published":
      return {
        id,
        kind: "published",
        title: `${entry.title} dipublikasikan`,
        detail: `${entry.count ?? 0} soal siap dikerjakan siswa.`,
        at: entry.at,
        href: assessment,
      };
    case "assessment_closed":
      return {
        id,
        kind: "closed",
        title: `${entry.title} selesai`,
        detail: `${entry.count ?? 0} siswa berhasil menyelesaikan asesmen.`,
        at: entry.at,
        href: assessment,
      };
    case "essays_pending":
      return {
        id,
        kind: "grading",
        title: "Jawaban uraian menunggu dinilai",
        detail: `${entry.count ?? 0} jawaban di ${entry.title}.`,
        at: entry.at,
        href: assessment,
      };
    case "remedial_approved":
      return {
        id,
        kind: "remedial",
        title: "Paket remedial disetujui",
        detail: `Remedial untuk ${entry.title}.`,
        at: entry.at,
        href: `/${slug}/remedial?source=${entry.targetId}`,
      };
    case "material_uploaded":
      return {
        id,
        kind: "material",
        title: `${entry.title} diunggah`,
        detail: "Materi baru di Upload Materi.",
        at: entry.at,
        href: `/${slug}/curriculum?tab=materi`,
      };
    case "student_joined":
      return { id, kind: "joined", title: `${entry.title} bergabung ke kelas`, detail: "Bergabung dengan kode kelas.", at: entry.at };
  }
}

export function dashboardData(dashboard: TeacherDashboard, slug: string): DashboardData {
  const { overview } = dashboard;
  // An untagged wrong option is a pattern too, but the card needs a name.
  const top = dashboard.topMisconceptions.find((pattern) => pattern.tag);
  const trend = overview.trend;
  const chapters: ChapterDiagnosis[] = dashboard.quickDiagnosis.map((chapter) => ({
    id: chapter.chapterId,
    number: chapter.number,
    name: chapter.name,
    students: groups(chapter.students),
    objectives: chapter.learningObjectives.map((objective) => ({
      id: objective.learningObjective.id,
      number: objective.learningObjective.number,
      description: objective.learningObjective.description,
      itemCount: objective.itemCount,
      students: groups(objective.students),
    })),
  }));

  return {
    studentCount: overview.studentCount,
    assessedCount: overview.assessedCount,
    average:
      overview.averageScore === null
        ? null
        : {
            value: overview.averageScore,
            trend: trend === null ? null : trend > 0.5 ? "up" : trend < -0.5 ? "down" : "same",
          },
    remedial: overview.assessedCount > 0 ? { count: overview.remedialStudentCount } : null,
    topMisconception:
      top?.tag ? { tag: top.tag, studentCount: top.affectedCount, percent: Math.round(top.affectedPct) } : null,
    chapters,
    activities: dashboard.recentActivity.map((entry) => activityOf(entry, slug)),
  };
}

// Dashboard Guru in one request.
export const getDashboard = cache(async (subject: Subject): Promise<DashboardData> => {
  if (isMockMode) return mockDashboard;
  const dashboard = await apiFetch<TeacherDashboard>(`/subjects/${encodeURIComponent(subject.id)}/dashboard`);
  return dashboardData(dashboard, subject.slug);
});
