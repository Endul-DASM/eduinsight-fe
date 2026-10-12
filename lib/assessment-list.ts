import { type AssessmentFilters, getAssessment, getAssessments } from "@/lib/api/assessments";
import { getCurriculum } from "@/lib/api/curriculum";
import { getAssessmentAttempts } from "@/lib/api/dashboard";
import type { Assessment, CurriculumTree, LearningObjectiveRef, Subject } from "@/lib/api/types";

// One card of Daftar Asesmen (Figma New Design 54:7817).
export type AssessmentCard = {
  assessment: Assessment;
  // "Bab 1: Eksponen dan Logaritma", from the Babs of the assessment's TPs.
  chapters: string[];
  // "1.1", "1.2"
  objectiveNumbers: string[];
  // Students with an attempt still open, for "N SISWA SEDANG MENGERJAKAN"; null when not ongoing.
  activeStudents: number | null;
};

export function chapterLabels(objectives: LearningObjectiveRef[], tree: CurriculumTree | null): string[] {
  const ids = new Set(objectives.map((objective) => objective.chapterId));
  return (tree?.chapters ?? [])
    .filter((chapter) => ids.has(chapter.id))
    .sort((a, b) => a.number - b.number)
    .map((chapter) => `Bab ${chapter.number}: ${chapter.name}`);
}

export function objectiveNumbers(objectives: LearningObjectiveRef[]): string[] {
  return [...new Set(objectives.map((objective) => objective.number))].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
}

// GET /subjects/:id/assessments has no TPs or attempts, so each card also reads its assessment (for the Bab and TP
// lines) and, while it is ongoing, its attempts. A card whose extra data fails still shows with what the list has.
export async function getAssessmentCards(subject: Subject, filters: AssessmentFilters): Promise<AssessmentCard[]> {
  const [assessments, tree] = await Promise.all([
    getAssessments(subject.id, filters),
    getCurriculum(subject.id).catch(() => null),
  ]);

  return Promise.all(
    assessments.map(async (assessment) => {
      const [detail, attempts] = await Promise.all([
        getAssessment(assessment.id).catch(() => null),
        assessment.status === "ongoing" ? getAssessmentAttempts(assessment.id).catch(() => null) : null,
      ]);
      const objectives = detail?.learningObjectives ?? [];
      return {
        assessment,
        chapters: chapterLabels(objectives, tree),
        objectiveNumbers: objectiveNumbers(objectives),
        activeStudents: attempts
          ? new Set(attempts.filter((attempt) => attempt.status === "in_progress").map((attempt) => attempt.student.id)).size
          : null,
      };
    }),
  );
}
