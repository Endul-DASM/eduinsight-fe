// Dashboard Guru figures (SRS FR-G-010 – 012, 015), computed from the raw API data. Pure functions, so they can move
// to a backend endpoint later without changing the page.

import type { Assessment, CurriculumTree } from "@/lib/api/types";

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

export type ActivityKind = "published" | "closed" | "grading" | "joined";

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
  // Students with at least one scored attempt.
  assessedCount: number;
  average: { value: number; trend: "up" | "down" | "same" | null } | null;
  remedial: { count: number; assessmentTitle: string } | null;
  topMisconception: { tag: string; studentCount: number; percent: number } | null;
  chapters: ChapterDiagnosis[];
  activities: Activity[];
};

// Raw inputs, in the shape the API returns them.

export type EnrolledStudent = { id: string; name: string; username: string; nis: string | null; joinedAt: string };

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

export type AttemptItem = {
  questionId: string;
  number: number;
  isCorrect: boolean | null;
  // 0–100; null for an essay the teacher has not graded.
  score: number | null;
  misconceptionTag: string | null;
};

export type AssessedAssessment = {
  assessment: Assessment;
  // Question id → the TP ids it is tagged with.
  questionObjectives: Map<string, string[]>;
  attempts: AttemptSummary[];
  // Items of each student's best attempt, keyed by attempt id.
  items: Map<string, AttemptItem[]>;
};

// A student's result for an assessment is their best scored attempt (the backend's rule too).
export function bestAttempts(attempts: AttemptSummary[]): AttemptSummary[] {
  const best = new Map<string, AttemptSummary>();
  for (const attempt of attempts) {
    if (attempt.status !== "submitted" || attempt.score === null) continue;
    const current = best.get(attempt.student.id);
    if (!current || attempt.score > (current.score ?? -1)) best.set(attempt.student.id, attempt);
  }
  return [...best.values()];
}

function emptyGroups(): LabelGroups {
  return { SB: [], B: [], C: [], K: [] };
}

function groupByLabel(scores: StudentScore[]): LabelGroups {
  const groups = emptyGroups();
  for (const entry of scores) groups[labelOf(entry.score)].push(entry);
  for (const label of diagnosisLabels) groups[label].sort((a, b) => a.score - b.score || a.name.localeCompare(b.name));
  return groups;
}

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const DAY_MS = 24 * 60 * 60 * 1000;

// When an assessment's results came in, for picking the latest one.
function finishedAt(assessment: Assessment) {
  return assessment.closesAt ?? assessment.publishedAt ?? assessment.updatedAt;
}

export function computeDashboard(
  students: EnrolledStudent[],
  assessed: AssessedAssessment[],
  curriculum: CurriculumTree | null,
  assessmentHref: (id: string) => string,
  now = new Date(),
): DashboardData {
  const names = new Map(students.map((student) => [student.id, student.name]));
  const results = assessed.map((entry) => ({ ...entry, best: bestAttempts(entry.attempts) }));
  const allBest = results.flatMap((entry) => entry.best);
  for (const attempt of allBest) if (!names.has(attempt.student.id)) names.set(attempt.student.id, attempt.student.name);

  // Rata-rata nilai and its trend against the week before (FR-G-010).
  let average: DashboardData["average"] = null;
  if (allBest.length > 0) {
    const inWindow = (from: number, to: number) =>
      allBest
        .filter((attempt) => {
          const at = now.getTime() - new Date(attempt.submittedAt ?? attempt.startedAt).getTime();
          return at >= from * DAY_MS && at < to * DAY_MS;
        })
        .map((attempt) => attempt.score ?? 0);
    const thisWeek = inWindow(0, 7);
    const lastWeek = inWindow(7, 14);
    let trend: "up" | "down" | "same" | null = null;
    if (thisWeek.length > 0 && lastWeek.length > 0) {
      const difference = mean(thisWeek) - mean(lastWeek);
      trend = difference > 0.5 ? "up" : difference < -0.5 ? "down" : "same";
    }
    average = { value: mean(allBest.map((attempt) => attempt.score ?? 0)), trend };
  }

  // Butuh remedial: below the remedial threshold on the latest assessment with scores.
  let remedial: DashboardData["remedial"] = null;
  const latest = results
    .filter((entry) => entry.best.length > 0)
    .sort((a, b) => finishedAt(b.assessment).localeCompare(finishedAt(a.assessment)))[0];
  if (latest) {
    const threshold = latest.assessment.remedialThreshold ?? latest.assessment.kkm;
    remedial = {
      count: latest.best.filter((attempt) => (attempt.score ?? 0) < threshold).length,
      assessmentTitle: latest.assessment.title,
    };
  }

  // TP scores (BR-03): the share of points earned on the items tagged with the TP, per student.
  const objectiveTotals = new Map<string, Map<string, { sum: number; count: number }>>();
  const objectiveItems = new Map<string, Set<string>>();
  // Misconceptions (BR-06): unique students per tag, and the lowest item number for ties.
  const misconceptions = new Map<string, { students: Set<string>; firstItem: number }>();

  for (const entry of results) {
    for (const attempt of entry.best) {
      for (const item of entry.items.get(attempt.id) ?? []) {
        if (item.misconceptionTag && item.isCorrect !== true) {
          const tag = misconceptions.get(item.misconceptionTag) ?? { students: new Set(), firstItem: item.number };
          tag.students.add(attempt.student.id);
          tag.firstItem = Math.min(tag.firstItem, item.number);
          misconceptions.set(item.misconceptionTag, tag);
        }
        if (item.score === null) continue;
        for (const objectiveId of entry.questionObjectives.get(item.questionId) ?? []) {
          const perStudent = objectiveTotals.get(objectiveId) ?? new Map();
          const totals = perStudent.get(attempt.student.id) ?? { sum: 0, count: 0 };
          totals.sum += item.score;
          totals.count += 1;
          perStudent.set(attempt.student.id, totals);
          objectiveTotals.set(objectiveId, perStudent);
          const items = objectiveItems.get(objectiveId) ?? new Set();
          items.add(`${entry.assessment.id}:${item.questionId}`);
          objectiveItems.set(objectiveId, items);
        }
      }
    }
  }

  const assessedCount = new Set(allBest.map((attempt) => attempt.student.id)).size;
  const [topTag] = [...misconceptions.entries()].sort(
    ([, a], [, b]) => b.students.size - a.students.size || a.firstItem - b.firstItem,
  );
  const topMisconception = topTag
    ? {
        tag: topTag[0],
        studentCount: topTag[1].students.size,
        percent: assessedCount > 0 ? Math.round((topTag[1].students.size / assessedCount) * 100) : 0,
      }
    : null;

  // Diagnosis Cepat TP (FR-G-011): a student's Bab score is the mean of their TP scores in that Bab (BR-03).
  const chapters: ChapterDiagnosis[] = (curriculum?.chapters ?? [])
    .filter((chapter) => chapter.status === "final")
    .sort((a, b) => a.number - b.number)
    .map((chapter) => {
      const chapterScores = new Map<string, number[]>();
      const objectives = chapter.learningObjectives
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((objective) => {
          const scores: StudentScore[] = [];
          for (const [studentId, totals] of objectiveTotals.get(objective.id) ?? []) {
            const score = totals.sum / totals.count;
            scores.push({ studentId, name: names.get(studentId) ?? "Siswa", score });
            chapterScores.set(studentId, [...(chapterScores.get(studentId) ?? []), score]);
          }
          return {
            id: objective.id,
            number: objective.number,
            description: objective.description,
            itemCount: objectiveItems.get(objective.id)?.size ?? 0,
            students: groupByLabel(scores),
          };
        });
      const students = groupByLabel(
        [...chapterScores].map(([studentId, scores]) => ({
          studentId,
          name: names.get(studentId) ?? "Siswa",
          score: mean(scores),
        })),
      );
      return { id: chapter.id, number: chapter.number, name: chapter.name, students, objectives };
    });

  // Aktivitas Terbaru (FR-G-015), from what the API records. Remedial and reports come with their modules.
  const activities: Activity[] = [];
  for (const entry of results) {
    const { assessment } = entry;
    const href = assessmentHref(assessment.id);
    if (assessment.publishedAt) {
      activities.push({
        id: `published-${assessment.id}`,
        kind: "published",
        title: `${assessment.title} dipublikasikan`,
        detail: `${assessment.questionCount} soal siap dikerjakan siswa.`,
        at: assessment.publishedAt,
        href,
      });
    }
    if (assessment.status === "closed" && assessment.closesAt) {
      const submitted = new Set(
        entry.attempts.filter((attempt) => attempt.status === "submitted").map((attempt) => attempt.student.id),
      ).size;
      activities.push({
        id: `closed-${assessment.id}`,
        kind: "closed",
        title: `${assessment.title} selesai`,
        detail: `${submitted} siswa berhasil menyelesaikan asesmen.`,
        at: assessment.closesAt,
        href,
      });
    }
    const pending = entry.attempts.filter((attempt) => attempt.essaysPending > 0);
    if (pending.length > 0) {
      const lastSubmitted = pending
        .map((attempt) => attempt.submittedAt ?? attempt.startedAt)
        .sort()
        .at(-1) as string;
      activities.push({
        id: `grading-${assessment.id}`,
        kind: "grading",
        title: `Jawaban uraian menunggu dinilai`,
        detail: `${pending.reduce((sum, attempt) => sum + attempt.essaysPending, 0)} jawaban di ${assessment.title}.`,
        at: lastSubmitted,
        href,
      });
    }
  }
  for (const student of students) {
    activities.push({
      id: `joined-${student.id}`,
      kind: "joined",
      title: `${student.name} bergabung ke kelas`,
      detail: "Bergabung dengan kode kelas.",
      at: student.joinedAt,
    });
  }
  activities.sort((a, b) => b.at.localeCompare(a.at));

  return {
    studentCount: students.length,
    assessedCount,
    average,
    remedial,
    topMisconception,
    chapters,
    activities,
  };
}
