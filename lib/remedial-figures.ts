// Remedial figures (PRD 5.5.3, SRS FR-G-100 – 107) derived from the results of a source assessment and of the
// remedial assessment that follows it up. The backend has no remedial module yet, so the pairing is chosen by the
// teacher and everything is computed here. Pure functions, shared by the server pages and their client tables.

import type { AssessmentResults, ObjectivePerformance } from "@/lib/api/results";
import type { AssessmentType } from "@/lib/api/types";
import type { AttemptSummary } from "@/lib/dashboard/compute";

// BR-07: a score below the KKM on these triggers remedial; a pre-test does not.
export const REMEDIAL_SOURCE_TYPES: AssessmentType[] = ["post_test", "ulangan_harian", "uts", "uas"];

export type RemedialProgress = "belum_mulai" | "mengerjakan" | "selesai";

export const progressLabels: Record<RemedialProgress, { label: string; className: string }> = {
  belum_mulai: { label: "Belum Mulai", className: "bg-[rgba(153,188,229,0.6)] text-[#004695]" },
  mengerjakan: { label: "Sedang Mengerjakan", className: "bg-[#ffedd5] text-[#c2410c]" },
  selesai: { label: "Selesai", className: "bg-[#dcfce7] text-[#16a34a]" },
};

export const masteryLabels = {
  tuntas: { label: "Tuntas", className: "bg-[#dcfce7] text-[#16a34a]" },
  perlu_remedial: { label: "Perlu Remedial", className: "bg-[#fee2e2] text-[#dc2626]" },
} as const;

export type TargetRow = {
  studentId: string;
  name: string;
  // Score on the source assessment, below its KKM.
  initialScore: number;
  // Null when no remedial assessment is chosen.
  progress: RemedialProgress | null;
  // Final score of the remedial assessment; null until there is one (or while an essay waits for grading).
  newScore: number | null;
  // True while the remedial attempt is submitted but an essay is not graded yet.
  awaitingGrade: boolean;
  // FR-G-107: the remedial score at or above the source KKM makes the student tuntas.
  mastery: keyof typeof masteryLabels;
};

// FR-G-100, FR-G-106, FR-G-107: the students below the KKM on the source, with their remedial progress and score.
export function targetRows(
  source: AssessmentResults,
  remedial: AssessmentResults | null,
  attempts: AttemptSummary[] | null,
): TargetRow[] {
  const kkm = source.assessment.kkm;
  return source.students
    .filter((student) => student.status === "final" && student.score !== null && student.score < kkm)
    .map((student) => {
      const own = attempts?.filter((attempt) => attempt.student.id === student.student.id) ?? [];
      const result = remedial?.students.find((entry) => entry.student.id === student.student.id);
      const progress: RemedialProgress | null = !remedial
        ? null
        : own.some((attempt) => attempt.status === "submitted")
          ? "selesai"
          : own.some((attempt) => attempt.status === "in_progress")
            ? "mengerjakan"
            : "belum_mulai";
      const newScore = result?.status === "final" ? result.score : null;
      return {
        studentId: student.student.id,
        name: student.student.name,
        initialScore: student.score!,
        progress,
        newScore,
        awaitingGrade: result?.status === "grading_pending",
        mastery: (newScore !== null && newScore >= kkm ? "tuntas" : "perlu_remedial") as TargetRow["mastery"],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
}

// TPs not reached yet: the target students' average TP score is below the KKM (BR-03), weakest first.
export function weakObjectives(source: AssessmentResults, targets: TargetRow[]) {
  const ids = new Set(targets.map((target) => target.studentId));
  const students = source.students.filter((student) => ids.has(student.student.id));
  return source.learningObjectives
    .map((objective) => {
      const scores = students
        .map((student) => student.learningObjectives.find((entry) => entry.learningObjectiveId === objective.learningObjective.id)?.score)
        .filter((score): score is number => score !== null && score !== undefined);
      const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : null;
      return { objective, average };
    })
    .filter((entry): entry is { objective: ObjectivePerformance; average: number } =>
      entry.average !== null && entry.average < source.assessment.kkm,
    )
    .sort((a, b) => a.average - b.average);
}

// Riwayat Remedial: how a remedial assessment changed the scores of the students who took both.
export function improvementOf(source: AssessmentResults, remedial: AssessmentResults) {
  const before = new Map(
    source.students
      .filter((student) => student.status === "final" && student.score !== null)
      .map((student) => [student.student.id, student.score!]),
  );
  const pairs = remedial.students
    .filter((student) => student.status === "final" && student.score !== null && before.has(student.student.id))
    .map((student) => student.score! - before.get(student.student.id)!);
  const finals = remedial.students.filter((student) => student.status === "final" && student.score !== null);
  return {
    // Mean score change in points; null when nobody took both.
    averageChange: pairs.length ? pairs.reduce((sum, change) => sum + change, 0) / pairs.length : null,
    compared: pairs.length,
    mastered: finals.filter((student) => student.score! >= source.assessment.kkm).length,
    finals: finals.length,
  };
}

// Jadwalkan Remedial (FR-G-107; Figma New Design 86:10467): one day, a start and end time in WIB, and a duration.
export type RemedialScheduleValues = { title: string; date: string; start: string; end: string; duration: string };
export type RemedialScheduleErrors = Partial<Record<keyof RemedialScheduleValues, string>>;

export function validateRemedialSchedule(values: RemedialScheduleValues, publish: boolean): RemedialScheduleErrors {
  const errors: RemedialScheduleErrors = {};
  if (!values.title.trim() || values.title.trim().length > 200) errors.title = "Nama remedial 1–200 karakter.";
  const time = /^\d{2}:\d{2}$/;
  if (values.date && !/^\d{4}-\d{2}-\d{2}$/.test(values.date)) errors.date = "Format tanggal tidak valid.";
  if (values.start && !time.test(values.start)) errors.start = "Format waktu tidak valid.";
  if (values.end && !time.test(values.end)) errors.end = "Format waktu tidak valid.";
  if (values.start && values.end && time.test(values.start) && time.test(values.end) && values.end <= values.start) {
    errors.end = "Waktu selesai harus setelah waktu mulai.";
  }
  if (values.duration && !(/^\d+$/.test(values.duration) && Number(values.duration) >= 1 && Number(values.duration) <= 600)) {
    errors.duration = "Durasi 1–600 menit.";
  }
  if (publish) {
    if (!values.date) errors.date = "Tanggal pelaksanaan wajib diisi.";
    if (!values.start) errors.start = "Waktu mulai wajib diisi.";
    if (!values.end) errors.end = "Waktu selesai wajib diisi.";
    if (!values.duration) errors.duration = "Durasi wajib diisi.";
  }
  return errors;
}
