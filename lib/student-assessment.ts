// Student assessments (PRD 6.2, SRS FR-S-010 – 013) on top of GET /subjects/:id/my-assessments and the attempt
// endpoints. Pure functions, shared by the server pages and the attempt player.
import type { ActivityStatus, MyActivity, StudentAssessment } from "./api/student";

export type CardState = "available" | "resume" | "not_opened" | "closed" | "no_attempts" | "offline";

// Belum Dikerjakan: what the student can do with the assessment now.
export function cardState(assessment: StudentAssessment): CardState {
  if (assessment.openAttemptId) return "resume";
  if (assessment.mode === "luring") return "offline";
  if (assessment.status === "scheduled") return "not_opened";
  if (assessment.status === "closed") return "closed";
  if (!assessment.canStart) return "no_attempts";
  return "available";
}

export const cardStateLabels: Record<CardState, { label: string; className: string }> = {
  available: { label: "Tersedia", className: "bg-[rgba(153,188,229,0.6)] text-[#004695]" },
  resume: { label: "Sedang dikerjakan", className: "bg-[rgba(153,188,229,0.6)] text-[#004695]" },
  not_opened: { label: "Belum dibuka", className: "bg-[#ffedd5] text-[#9a3412]" },
  closed: { label: "Ditutup", className: "bg-[#eae7e9] text-[#45474c]" },
  no_attempts: { label: "Kesempatan habis", className: "bg-[#eae7e9] text-[#45474c]" },
  offline: { label: "Luring", className: "bg-[#eae7e9] text-[#45474c]" },
};

// Sudah Selesai: the student has handed in at least one attempt and has none in progress.
export function isDone(assessment: StudentAssessment): boolean {
  return assessment.attemptsUsed > 0 && !assessment.openAttemptId;
}

export type ResultState = "lulus" | "perlu_remedial" | "diproses" | "dinilai";

export const resultStateLabels: Record<ResultState, { label: string; className: string }> = {
  lulus: { label: "Lulus", className: "bg-[#dcfce7] text-[#166534]" },
  perlu_remedial: { label: "Perlu Remedial", className: "bg-[#fee2e2] text-[#b91c1c]" },
  diproses: { label: "Diproses", className: "bg-[#ffedd5] text-[#9a3412]" },
  dinilai: { label: "Dinilai", className: "bg-[rgba(153,188,229,0.6)] text-[#004695]" },
};

// my-assessments has no KKM, so tuntas/belum tuntas comes from the dashboard's recent activity when it lists the
// assessment; otherwise the result only says it is graded.
export function resultState(assessment: StudentAssessment, statuses: Map<string, ActivityStatus>): ResultState {
  if (assessment.bestScore === null) return "diproses";
  const status = statuses.get(assessment.id);
  if (status === "tuntas") return "lulus";
  if (status === "belum_tuntas") return "perlu_remedial";
  return "dinilai";
}

// The latest status per assessment, from my-dashboard recentActivity (newest first).
export function statusesOf(activity: MyActivity[]): Map<string, ActivityStatus> {
  const statuses = new Map<string, ActivityStatus>();
  for (const item of activity) {
    if (item.kind === "assessment" && item.assessment && item.status && !statuses.has(item.assessment.id)) {
      statuses.set(item.assessment.id, item.status);
    }
  }
  return statuses;
}

export function topicOf(assessment: StudentAssessment): string {
  return assessment.learningObjectives.map((objective) => `TP ${objective.number}`).join(", ") || "Semua materi";
}

// Semester from the date: Juli – Desember is Ganjil, Januari – Juni is Genap.
export function semesterOf(date = new Date()): "Ganjil" | "Genap" {
  const month = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", month: "numeric" }).format(date));
  return month >= 7 ? "Ganjil" : "Genap";
}

const dayFormat = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric" });

export function shortDate(iso: string): string {
  return dayFormat.format(new Date(iso));
}

// 32:15 or 1:02:05.
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

// "42 menit" from the start to the hand-in.
export function durationText(startedAt: string, submittedAt: string | null): string {
  if (!submittedAt) return "–";
  const minutes = Math.max(1, Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 60000));
  return minutes >= 60 ? `${Math.floor(minutes / 60)} jam ${minutes % 60} menit` : `${minutes} menit`;
}

export function isAnswered(answer: string | null | undefined): boolean {
  return Boolean(answer && answer.trim());
}
