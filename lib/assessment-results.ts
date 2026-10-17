// Figures of the Hasil Asesmen pages (FR-G-070 – 073) derived from GET /assessments/:id/results. Pure functions,
// shared by the server page and its client tables.

import type {
  AssessmentResults,
  ObjectivePerformance,
  QuestionPerformance,
  ResultStatus,
  StudentPerformance,
} from "@/lib/api/results";

// "71,8" — scores are shown with up to two decimals, in Indonesian notation.
const numberFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });

export function formatScore(value: number | null | undefined): string {
  return value === null || value === undefined ? "–" : numberFormat.format(value);
}

export function formatPercent(value: number | null | undefined): string {
  return value === null || value === undefined ? "–" : `${numberFormat.format(value)}%`;
}

export type ResultLabel = "tuntas" | "belum_tuntas" | "menunggu" | "belum_mengerjakan";

export const resultLabels: Record<ResultLabel, { label: string; className: string }> = {
  tuntas: { label: "Tuntas", className: "bg-[#dcfce7] text-[#16a34a]" },
  belum_tuntas: { label: "Belum tuntas", className: "bg-[#ffedd5] text-[#c2410c]" },
  menunggu: { label: "Menunggu penilaian", className: "bg-[#e6eff9] text-[#004695]" },
  belum_mengerjakan: { label: "Belum mengerjakan", className: "bg-[#f0edef] text-[#45474c]" },
};

export function resultLabelOf(student: StudentPerformance): ResultLabel {
  const map: Record<ResultStatus, ResultLabel> = {
    final: student.mastered ? "tuntas" : "belum_tuntas",
    grading_pending: "menunggu",
    not_attempted: "belum_mengerjakan",
  };
  return map[student.status];
}

export const finalStudents = (results: AssessmentResults) =>
  results.students.filter((student) => student.status === "final" && student.score !== null);

// Sebaran nilai (Figma New Design 65:13118): four ranges, the last one starting at the KKM so it reads "tuntas".
// The backend's ten bins are finer than the design; the ranges here come from the final scores directly.
export function scoreRanges(results: AssessmentResults) {
  const kkm = results.assessment.kkm;
  const bounds = [0, 25, 50, kkm].filter((bound, index, list) => index === 0 || bound > list[index - 1]);
  const scores = finalStudents(results).map((student) => student.score!);
  return bounds.map((from, index) => {
    const to = bounds[index + 1];
    const last = to === undefined;
    return {
      label: last ? `${from}–100` : `${from}–<${to}`,
      passing: last,
      count: scores.filter((score) => score >= from && (last || score < to)).length,
    };
  });
}

// "Fokus Tindak Lanjut": who has not reached the KKM, and the TP the class did worst on.
export function followUp(results: AssessmentResults) {
  const below = finalStudents(results).filter((student) => !student.mastered);
  const scored = results.learningObjectives.filter((objective) => objective.classAverage !== null);
  const weakest = scored.reduce<ObjectivePerformance | null>(
    (lowest, objective) => (!lowest || objective.classAverage! < lowest.classAverage! ? objective : lowest),
    null,
  );
  return { below, weakest };
}

// Pilihan ganda keys per question number, for the "Kunci A" header of the student table.
export function answerKeyOf(question: QuestionPerformance): string | null {
  return question.options?.find((option) => option.isKey)?.key ?? null;
}

// The recap row of Performa Siswa: per question the right answers among those who answered it, and the totals.
export function itemRecap(results: AssessmentResults, students: StudentPerformance[]) {
  const counted = students.filter((student) => student.status !== "not_attempted");
  const perQuestion = results.questions.map((question) => {
    const items = counted.map((student) => student.items.find((item) => item.questionId === question.questionId));
    return {
      questionId: question.questionId,
      correct: items.filter((item) => item?.isCorrect).length,
      total: items.filter((item) => item !== undefined).length,
    };
  });
  const finals = counted.filter((student) => student.status === "final" && student.score !== null);
  return {
    perQuestion,
    correct: perQuestion.reduce((sum, item) => sum + item.correct, 0),
    total: perQuestion.reduce((sum, item) => sum + item.total, 0),
    average: finals.length ? finals.reduce((sum, student) => sum + student.score!, 0) / finals.length : null,
    mastered: finals.filter((student) => student.mastered).length,
    finals: finals.length,
  };
}

export const correctCountOf = (student: StudentPerformance) => student.items.filter((item) => item.isCorrect).length;

// Proporsi benar in percent. Pilihan ganda from the counts (the backend rounds pValue to two decimals, so 2/3 would
// show 67% next to an option share of 66,67%); uraian from the mean item score.
export function proportionOf(question: QuestionPerformance): number | null {
  if (question.correctCount !== null && question.responseCount > 0) return (question.correctCount / question.responseCount) * 100;
  return question.pValue === null ? null : question.pValue * 100;
}

// The question the class answered worst, for the note under Performa Soal.
export function weakestQuestion(results: AssessmentResults): QuestionPerformance | null {
  return results.questions.reduce<QuestionPerformance | null>(
    (lowest, question) => {
      const proportion = proportionOf(question);
      if (proportion === null) return lowest;
      return !lowest || proportion < proportionOf(lowest)! ? question : lowest;
    },
    null,
  );
}

// TPs grouped by Bab, in Bab then TP order (FR-G-072).
export function objectivesByChapter(results: AssessmentResults) {
  const groups = new Map<number, { number: number; name: string; objectives: ObjectivePerformance[] }>();
  for (const objective of results.learningObjectives) {
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

// "Bab 1 · Eksponen dan Logaritma" for a question, from the TPs it is tagged with.
export function chapterLabelOf(results: AssessmentResults, question: QuestionPerformance): string {
  const ids = new Set(question.learningObjectives.map((objective) => objective.id));
  const chapters = new Map(
    results.learningObjectives
      .filter((objective) => ids.has(objective.learningObjective.id))
      .map((objective) => [objective.chapterNumber, objective.chapterName]),
  );
  return [...chapters.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([number, name]) => `Bab ${number}: ${name}`)
    .join(", ");
}
