// Remedial siswa (PRD S-REM-01, SRS FR-S-050, 051) on top of GET /my-remedials, per subject. Pure functions.
import type { AssessmentType } from "./api/types";
import type { MyRemedial, RemedialStatus, StudentAssessment } from "./api/student";

// Assessments that can send a student to remedial (BE REMEDIAL_SOURCE_TYPES).
const sourceTypes: AssessmentType[] = ["post_test", "ulangan_harian", "uts", "uas"];

export const remedialStatusLabels: Record<RemedialStatus, { label: string; className: string }> = {
  perlu_remedial: { label: "Menunggu materi", className: "bg-[rgba(153,188,229,0.6)] text-[#004695]" },
  menunggu_materi: { label: "Menunggu materi", className: "bg-[rgba(153,188,229,0.6)] text-[#004695]" },
  mengerjakan: { label: "Perlu remedial", className: "bg-[#fee2e2] text-[#dc2626]" },
  reassessment: { label: "Menunggu reassessment", className: "bg-[#ffedd5] text-[#9a3412]" },
  tuntas: { label: "Tuntas", className: "bg-[#dcfce7] text-[#166534]" },
};

export const isActive = (remedial: MyRemedial) => remedial.status !== "tuntas";

export const remedialsOf = (remedials: MyRemedial[], subjectId: string) =>
  remedials.filter((remedial) => remedial.subjectId === subjectId);

// The remedial a remedial assessment belongs to, with that assessment. Null when the student may not take it (FR-G-105).
export function findRemedialAssessment(remedials: MyRemedial[], subjectId: string, assessmentId: string) {
  for (const remedial of remedialsOf(remedials, subjectId)) {
    const assessment = remedial.assessments.find((entry) => entry.id === assessmentId);
    if (assessment) return { remedial, assessment };
  }
  return null;
}

// The remedial assessment to open next: the one in progress, then one that can start, then the next scheduled one.
export function nextAssessment(remedial: MyRemedial): StudentAssessment | null {
  const open = remedial.assessments;
  return (
    open.find((assessment) => assessment.openAttemptId) ??
    open.find((assessment) => assessment.canStart) ??
    open.filter((assessment) => assessment.status === "scheduled").sort((a, b) => a.opensAt.localeCompare(b.opensAt))[0] ??
    null
  );
}

// Why there is nothing to start, for the disabled button.
export function waitingReason(remedial: MyRemedial): string {
  if (remedial.status === "reassessment") return "Menunggu reassessment";
  if (!remedial.package) return "Menunggu materi dari guru";
  return "Belum ada soal remedial";
}

// "TP 1.1, TP 1.2": the weak TPs of the approved package, or else the TPs of the remedial assessments.
export function topicOf(remedial: MyRemedial): string {
  const numbers = remedial.package
    ? remedial.package.weakObjectives.map((objective) => objective.learningObjective.number)
    : remedial.assessments.flatMap((assessment) => assessment.learningObjectives.map((objective) => objective.number));
  const unique = [...new Set(numbers)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return unique.length ? unique.map((number) => `TP ${number}`).join(", ") : "Belum ditentukan";
}

export type DoneCard = { id: string; title: string; note: string; score: number };

// Asesmen yang sudah tuntas: remedials that ended tuntas, plus graded source assessments without a remedial for the
// student (my-remedials lists every source the student is a remedial target of).
export function doneCards(remedials: MyRemedial[], assessments: StudentAssessment[]): DoneCard[] {
  const sources = new Set(remedials.map((remedial) => remedial.sourceAssessment.id));
  const healed = remedials
    .filter((remedial) => !isActive(remedial))
    .map((remedial) => ({
      id: remedial.sourceAssessment.id,
      title: remedial.sourceAssessment.title,
      note: "Tuntas setelah remedial",
      score: remedial.finalScore,
    }));
  const passed = assessments
    .filter((assessment) => sourceTypes.includes(assessment.type) && assessment.bestScore !== null && !sources.has(assessment.id))
    .map((assessment) => ({ id: assessment.id, title: assessment.title, note: "Tidak perlu remedial", score: assessment.bestScore! }));
  return [...healed, ...passed];
}

// Persentase Ketuntasan: tuntas assessments of all graded source assessments.
export function completion(remedials: MyRemedial[], assessments: StudentAssessment[]) {
  const done = doneCards(remedials, assessments).length;
  const total = done + remedials.filter(isActive).length;
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}
