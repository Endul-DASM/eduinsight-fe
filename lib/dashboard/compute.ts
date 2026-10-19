// Dashboard Guru figures (SRS FR-G-010 – 012, 015) as the page shows them; lib/api/dashboard.ts maps
// GET /subjects/:id/dashboard into this shape. Also the BR-04 labels shared with Diagnosis and Hasil Asesmen.

export type DiagnosisLabel = "SB" | "B" | "C" | "K";

export const diagnosisLabels: DiagnosisLabel[] = ["SB", "B", "C", "K"];

export const diagnosisLabelNames: Record<DiagnosisLabel, string> = {
  SB: "Sangat Baik",
  B: "Baik",
  C: "Cukup",
  K: "Kurang",
};

// BR-04: the default labels for a TP or Bab score.
export function labelOf(score: number): DiagnosisLabel {
  if (score >= 90) return "SB";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "K";
}

// BR-05: a TP assessed with fewer items is flagged as "data terbatas".
export const MIN_ITEMS_PER_TP = 3;

export type StudentScore = { studentId: string; name: string; score: number };

export type LabelGroups = Record<DiagnosisLabel, StudentScore[]>;

export type ObjectiveDiagnosis = {
  id: string;
  number: string;
  description: string;
  // Distinct questions tagged with this TP across the scored assessments (BR-05).
  itemCount: number;
  students: LabelGroups;
};

export type ChapterDiagnosis = {
  id: string;
  number: number;
  name: string;
  students: LabelGroups;
  objectives: ObjectiveDiagnosis[];
};

export type ActivityKind = "published" | "closed" | "grading" | "remedial" | "material" | "joined";

export type Activity = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: string;
  href?: string;
};

export type DashboardData = {
  studentCount: number;
  // Students with a final score.
  assessedCount: number;
  // The trend compares the last 30 days with the 30 days before.
  average: { value: number; trend: "up" | "down" | "same" | null } | null;
  // Students not tuntas yet across every source assessment; null before anything is scored.
  remedial: { count: number } | null;
  topMisconception: { tag: string; studentCount: number; percent: number } | null;
  chapters: ChapterDiagnosis[];
  activities: Activity[];
};

// GET /assessments/:id/attempts, as the remedial and assessment list pages use it.
export type AttemptSummary = {
  id: string;
  student: { id: string; name: string; username: string; nis: string | null };
  number: number;
  status: "in_progress" | "submitted";
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  essaysPending: number;
};
