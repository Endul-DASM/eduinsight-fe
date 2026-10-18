// Diagnosis Belajar siswa (PRD S-DIA-01, SRS FR-S-040, 042) on top of GET /subjects/:id/my-diagnosis. Pure functions.
import type { MyDiagnosis, MyDiagnosisItem, MyObjectiveDiagnosis, StudentLabel } from "./api/student";
import { type DiagnosisLabel, diagnosisLabelNames, labelBar, labelChip, toLabel } from "./diagnosis";
import { formatPoints } from "./student-dashboard";

const mean = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

// BR-04: the label of a score from the lower bounds.
export function labelOf(score: number, thresholds: MyDiagnosis["thresholds"]): StudentLabel {
  if (score >= thresholds.sb) return "sb";
  if (score >= thresholds.b) return "b";
  if (score >= thresholds.c) return "c";
  return "k";
}

// Penguasaan Keseluruhan: the mean of the student's TP scores, and the class mean over the same TPs.
export function overallMastery(diagnosis: MyDiagnosis) {
  const scored = diagnosis.learningObjectives.filter((objective) => objective.score !== null);
  const score = mean(scored.map((objective) => objective.score!));
  const compared = scored.filter((objective) => objective.classAverage !== null);
  return {
    score,
    label: score === null ? null : labelOf(score, diagnosis.thresholds),
    classAverage: mean(compared.map((objective) => objective.classAverage!)),
    // The student's mean over the TPs that also have a class average, so the gap compares like with like.
    comparedScore: mean(compared.map((objective) => objective.score!)),
    scoredCount: scored.length,
  };
}

// "4 poin di atas rata-rata kelas"
export function gapText(score: number | null, classAverage: number | null): string | null {
  if (score === null || classAverage === null) return null;
  const gap = score - classAverage;
  if (Math.abs(gap) < 0.005) return "Sama dengan rata-rata kelas";
  return `${formatPoints(Math.abs(gap))} poin ${gap > 0 ? "di atas" : "di bawah"} rata-rata kelas`;
}

export const objectiveById = (diagnosis: MyDiagnosis, id: string | null) =>
  id ? (diagnosis.learningObjectives.find((objective) => objective.learningObjective.id === id) ?? null) : null;

// TPs in Bab then TP order.
export function sortedObjectives(objectives: MyObjectiveDiagnosis[]): MyObjectiveDiagnosis[] {
  return [...objectives].sort(
    (a, b) =>
      a.chapterNumber - b.chapterNumber ||
      a.learningObjective.number.localeCompare(b.learningObjective.number, undefined, { numeric: true }),
  );
}

// The status chip of a TP row (Figma New Design 175:33439).
const statusNames: Record<DiagnosisLabel, string> = {
  SB: "Dikuasai",
  B: "Sesuai jalur",
  C: "Perlu latihan",
  K: "Perlu perhatian",
};

export function masteryStatus(label: StudentLabel | null) {
  const upper = toLabel(label);
  if (!upper) return { label: "Belum dinilai", level: "Belum ada nilai", chip: "bg-[#f5f3f4] text-[#45474c]", bar: "bg-[#c5c6cd]" };
  return {
    label: statusNames[upper],
    level: `${diagnosisLabelNames[upper]} (${upper})`,
    chip: labelChip[upper],
    bar: labelBar[upper],
  };
}

// "3 butir di 2 asesmen"
export function itemsText(objective: MyObjectiveDiagnosis): string {
  const assessments = new Set(objective.items.map((item) => item.assessmentId)).size;
  return `${objective.items.length} butir di ${assessments} asesmen`;
}

// The item that pulled the TP score down the most.
export function lowestItem(objective: MyObjectiveDiagnosis): MyDiagnosisItem | null {
  return objective.items.reduce<MyDiagnosisItem | null>((low, item) => (!low || item.score < low.score ? item : low), null);
}
