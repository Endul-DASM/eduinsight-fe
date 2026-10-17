// Analisis Soal figures (PRD 5.5.2, SRS FR-G-090 – 093) on top of GET /assessments/:id/analysis. Pure functions, shared
// by the page and the CSV download.
import type { AssessmentAnalysis, ItemAnalysis, ItemDifficulty, ItemIssue, ItemLabel, ItemValidity } from "./api/analysis";

// Thresholds of FR-G-090 – 092 (OI-12: defaults until the subject teacher confirms them).
export const thresholds = { easy: 0.7, hard: 0.3, validity: 0.3, reliability: 0.7 } as const;

const coefficientFormat = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// P-index, point-biserial and reliability as "0,53".
export function formatCoefficient(value: number | null | undefined): string {
  return value === null || value === undefined ? "–" : coefficientFormat.format(value);
}

export const difficultyLabels: Record<ItemDifficulty, { label: string; className: string; bar: string }> = {
  mudah: { label: "Mudah", className: "text-[#45474c]", bar: "bg-[#99bce5]" },
  sedang: { label: "Sedang", className: "text-[#45474c]", bar: "bg-[#0058be]" },
  sulit: { label: "Sulit", className: "text-[#45474c]", bar: "bg-[#003d84]" },
};

export const difficultyOrder: ItemDifficulty[] = ["mudah", "sedang", "sulit"];

export const validityLabels: Record<ItemValidity, { label: string; className: string }> = {
  sesuai: { label: "Sesuai", className: "bg-[#dcfce7] text-[#166534]" },
  perlu_ditinjau: { label: "Perlu Ditinjau", className: "bg-[#fee2e2] text-[#b91c1c]" },
};

export const itemLabels: Record<ItemLabel, { label: string; className: string }> = {
  baik: { label: "Baik", className: "bg-[#dcfce7] text-[#166534]" },
  revisi: { label: "Revisi", className: "bg-[#ffedd5] text-[#9a3412]" },
  perlu_ditinjau: { label: "Perlu Ditinjau", className: "bg-[#fee2e2] text-[#b91c1c]" },
};

export const issueLabels: Record<ItemIssue, string> = {
  difficulty: "Difficulty di luar 0,30–0,70",
  validity: "Point-biserial < 0,30",
  reliability: "Reliabilitas naik bila butir dibuang",
};

export const reliabilityMethods = { kr20: "KR-20", cronbach: "Cronbach's Alpha" } as const;

// Benar / N for a PG item: students who chose the key among the analyzed ones. Null for essays.
export function correctOf(item: ItemAnalysis): number | null {
  return item.options?.find((option) => option.isKey)?.count ?? null;
}

export function difficultyCounts(items: ItemAnalysis[]): Record<ItemDifficulty, number> {
  const counts = { mudah: 0, sedang: 0, sulit: 0 };
  for (const item of items) if (item.difficulty) counts[item.difficulty] += 1;
  return counts;
}

export function validityCounts(items: ItemAnalysis[]) {
  return {
    sesuai: items.filter((item) => item.validity === "sesuai").length,
    perluDitinjau: items.filter((item) => item.validity === "perlu_ditinjau").length,
    // Too little data for a point-biserial (no other item on its TP, or the scores do not vary).
    limited: items.filter((item) => item.label !== null && item.validity === null).length,
  };
}

// Item Analysis banner: Perlu Ditinjau first, then Revisi.
export function attentionItems(items: ItemAnalysis[]) {
  return {
    priority: items.filter((item) => item.label === "perlu_ditinjau").map((item) => item.number),
    revise: items.filter((item) => item.label === "revisi").map((item) => item.number),
  };
}

// "butir 1, 6 & 9"
export function numberList(numbers: number[]): string {
  if (numbers.length <= 1) return numbers.join("");
  return `${numbers.slice(0, -1).join(", ")} & ${numbers.at(-1)}`;
}

export function objectiveNumbers(item: ItemAnalysis): string {
  return item.learningObjectives.map((objective) => `TP ${objective.number}`).join(", ") || "–";
}

function csvCell(value: string | number | null): string {
  const text = value === null ? "" : String(value);
  return /[";\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

// Laporan Analisis Soal as CSV (semicolon-separated with a BOM so Excel in Indonesian locale opens it in columns).
export function analysisCsv(analysis: AssessmentAnalysis): string {
  const { summary } = analysis;
  const head = [
    "No",
    "Tipe",
    "TP",
    "Soal",
    "Benar",
    "N",
    "P-index",
    "Difficulty",
    "r point-biserial",
    "Validity",
    "Alpha bila dibuang",
    "Metrik di luar ambang",
    "Keterangan",
    "Label item",
  ];
  const rows = analysis.items.map((item) => [
    item.number,
    item.type === "pg" ? "PG" : "Uraian",
    item.learningObjectives.map((objective) => objective.number).join(", "),
    item.stem.replace(/\s+/g, " ").trim(),
    correctOf(item),
    summary.analyzedStudents,
    formatCoefficient(item.pValue),
    item.difficulty ? difficultyLabels[item.difficulty].label : "",
    formatCoefficient(item.pointBiserial),
    item.validity ? validityLabels[item.validity].label : "Data terbatas",
    formatCoefficient(item.alphaIfDeleted),
    item.issues.length,
    item.issues.map((issue) => issueLabels[issue]).join(", "),
    item.label ? itemLabels[item.label].label : "",
  ]);
  const reliability = summary.reliability
    ? `${formatCoefficient(summary.reliability.value)} (${reliabilityMethods[summary.reliability.method]}, ${summary.reliability.reliable ? "Reliabel" : "Belum reliabel"})`
    : "Data belum cukup";
  const meta = [
    ["Asesmen", analysis.assessment.title],
    ["Siswa dianalisis", summary.analyzedStudents],
    ["Rata-rata P-index", formatCoefficient(summary.averagePValue)],
    ["Reliability", reliability],
    [],
  ];
  return `﻿${[...meta, head, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")}\r\n`;
}
