// Figures of the Analisis › Diagnosis pages (FR-G-080 – 085) derived from the diagnosis endpoints. Pure functions,
// shared by the server pages and their client parts.

import type {
  ApiDiagnosisLabel,
  ClassDiagnosis,
  LabelCounts,
  MisconceptionPattern,
  ObjectiveDiagnosis,
  StudentDiagnosisRow,
} from "@/lib/api/diagnosis";
import { type DiagnosisLabel, diagnosisLabelNames, diagnosisLabels } from "@/lib/dashboard/compute";

export { diagnosisLabelNames, diagnosisLabels };
export type { DiagnosisLabel };

export const toLabel = (label: ApiDiagnosisLabel | null): DiagnosisLabel | null =>
  label ? (label.toUpperCase() as DiagnosisLabel) : null;

export const countOf = (counts: LabelCounts, label: DiagnosisLabel) => counts[label.toLowerCase() as ApiDiagnosisLabel];

// The label colors of Diagnosis Cepat TP on the dashboard.
export const labelChip: Record<DiagnosisLabel, string> = {
  SB: "bg-[#dcfce7] text-[#16a34a]",
  B: "bg-[#e6eff9] text-[#004695]",
  C: "bg-[#ffedd5] text-[#c2410c]",
  K: "bg-[#fee2e2] text-[#dc2626]",
};

export const labelCell: Record<DiagnosisLabel, string> = {
  SB: "bg-[#22c55e] text-[#f0fdf4]",
  B: "bg-[#bbf7d0] text-[#14532d]",
  C: "bg-[#fed7aa] text-[#7c2d12]",
  K: "bg-[#fecaca] text-[#991b1b]",
};

export const labelBar: Record<DiagnosisLabel, string> = {
  SB: "bg-[#16a34a]",
  B: "bg-[#0058be]",
  C: "bg-[#c2410c]",
  K: "bg-[#dc2626]",
};

// Heatmap ketercapaian kelas (Figma New Design 65:15809): a 0–100 color scale, darker is higher. It is a scale, not
// the SB/B/C/K thresholds.
export const heatScale = [
  { from: 0, className: "bg-[#e6eff9] text-[#003264]" },
  { from: 60, className: "bg-[#c6d9f1] text-[#003264]" },
  { from: 70, className: "bg-[#99bce5] text-[#003264]" },
  { from: 80, className: "bg-[#0058be] text-[#f5f3f4]" },
  { from: 90, className: "bg-[#003264] text-[#f5f3f4]" },
] as const;

export function heatClassName(score: number | null): string {
  if (score === null) return "bg-[#f5f3f4] text-[#75777d]";
  return [...heatScale].reverse().find((step) => score >= step.from)!.className;
}

const mean = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);

// The three cards on top of Diagnosis Kelas.
export function classSummary(diagnosis: ClassDiagnosis) {
  const scored = diagnosis.learningObjectives.filter((objective) => objective.classAverage !== null);
  const weakest = scored.reduce<ObjectiveDiagnosis | null>(
    (lowest, objective) => (!lowest || objective.classAverage! < lowest.classAverage! ? objective : lowest),
    null,
  );
  return {
    average: mean(scored.map((objective) => objective.classAverage!)),
    objectiveCount: diagnosis.learningObjectives.length,
    weakest,
    topPattern: diagnosis.misconceptions.find((pattern) => pattern.rank === 1) ?? null,
  };
}

// TPs grouped by Bab, in Bab then TP order.
export function objectivesByChapter(objectives: ObjectiveDiagnosis[]) {
  const groups = new Map<number, { number: number; name: string; objectives: ObjectiveDiagnosis[] }>();
  for (const objective of objectives) {
    const group = groups.get(objective.chapterNumber) ?? { number: objective.chapterNumber, name: objective.chapterName, objectives: [] };
    group.objectives.push(objective);
    groups.set(objective.chapterNumber, group);
  }
  return [...groups.values()]
    .sort((a, b) => a.number - b.number)
    .map((group) => ({
      ...group,
      objectives: group.objectives.sort((a, b) =>
        a.learningObjective.number.localeCompare(b.learningObjective.number, undefined, { numeric: true }),
      ),
    }));
}

// A student's mean over the TPs that have a score.
export function studentAverage(row: StudentDiagnosisRow): number | null {
  return mean(row.learningObjectives.map((entry) => entry.score).filter((score): score is number => score !== null));
}

export function scoreOf(row: StudentDiagnosisRow, objectiveId: string) {
  return row.learningObjectives.find((entry) => entry.learningObjectiveId === objectiveId) ?? null;
}

// Patterns whose source questions are tagged with the TP. questionObjectives maps a question id to its TP ids,
// read from the assessments in scope.
export function patternsForObjective(
  patterns: MisconceptionPattern[],
  questionObjectives: Map<string, string[]>,
  objectiveId: string,
): MisconceptionPattern[] {
  return patterns.filter((pattern) =>
    pattern.sources.some((source) => questionObjectives.get(source.questionId)?.includes(objectiveId)),
  );
}

// "Butir 2 · opsi A" for a pattern's evidence.
export function sourceLabel(pattern: MisconceptionPattern): string {
  return pattern.sources
    .map((source) => `butir ${source.number}${source.option ? ` · opsi ${source.option}` : ""}`)
    .join(", ");
}

export const patternTitle = (pattern: MisconceptionPattern) => pattern.tag ?? "Jawaban salah tanpa tag miskonsepsi";

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
