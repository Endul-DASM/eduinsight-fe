import { getAssessments } from "@/lib/api/assessments";
import { getCurriculum } from "@/lib/api/curriculum";
import { getAssessmentAttempts } from "@/lib/api/dashboard";
import { getMaterial, getMaterialsForObjective } from "@/lib/api/materials";
import { type AssessmentResults, getAssessmentResults } from "@/lib/api/results";
import type { Assessment, CurriculumTree, Subject } from "@/lib/api/types";
import { improvementOf, REMEDIAL_SOURCE_TYPES, type TargetRow, targetRows, weakObjectives } from "@/lib/remedial-figures";

// The backend has no remedial module yet (no link between a source assessment and its remedial one, no groups, no
// ACC), so these pages are assembled from the results, attempts and materials endpoints. The teacher picks the
// source assessment and the remedial assessment; both stay in the URL (?source=&remedial=).

const newestFirst = (a: Assessment, b: Assessment) =>
  (b.opensAt ?? b.updatedAt).localeCompare(a.opensAt ?? a.updatedAt);

export type RemedialPair = {
  // Published post-test / ulangan harian / UTS / UAS (BR-07), newest first.
  sources: Assessment[];
  // Assessments of type remedial, newest first.
  remedials: Assessment[];
  source: Assessment | null;
  remedial: Assessment | null;
  sourceResults: AssessmentResults | null;
  remedialResults: AssessmentResults | null;
  targets: TargetRow[];
};

export async function getRemedialPair(subject: Subject, sourceParam: unknown, remedialParam: unknown): Promise<RemedialPair> {
  const all = await getAssessments(subject.id);
  const sources = all
    .filter((assessment) => REMEDIAL_SOURCE_TYPES.includes(assessment.type) && assessment.status !== "draft")
    .sort(newestFirst);
  const remedials = all.filter((assessment) => assessment.type === "remedial").sort(newestFirst);
  const source = sources.find((assessment) => assessment.id === sourceParam) ?? sources[0] ?? null;
  const remedial = remedials.find((assessment) => assessment.id === remedialParam) ?? remedials[0] ?? null;

  // A draft has no attempts or results yet.
  const remedialOpen = remedial && remedial.status !== "draft";
  const [sourceResults, remedialResults, attempts] = await Promise.all([
    source ? getAssessmentResults(source.id) : null,
    remedialOpen ? getAssessmentResults(remedial.id) : null,
    remedialOpen ? getAssessmentAttempts(remedial.id).catch(() => null) : null,
  ]);

  return {
    sources,
    remedials,
    source,
    remedial,
    sourceResults,
    remedialResults,
    targets: sourceResults ? targetRows(sourceResults, remedial ? remedialResults : null, remedial ? (attempts ?? []) : null) : [],
  };
}

export type MaterialReference = {
  objectiveId: string;
  objectiveNumber: string;
  objectiveDescription: string;
  // Average TP score of the target students.
  average: number;
  // "Bab 3 → 3.1 Bentuk umum"
  location: string;
  materials: { id: string; title: string; sections: string[] }[];
};

// Rujukan materi sesuai TP yang belum tercapai (the non-AI part of FR-G-102): for each weak TP, the materials mapped
// to it (FR-G-032) and the sections that carry the mapping.
export async function getMaterialReferences(
  subject: Subject,
  sourceResults: AssessmentResults,
  targets: TargetRow[],
): Promise<MaterialReference[]> {
  const weak = weakObjectives(sourceResults, targets);
  if (weak.length === 0) return [];
  const tree: CurriculumTree | null = await getCurriculum(subject.id).catch(() => null);

  return Promise.all(
    weak.map(async ({ objective, average }) => {
      const id = objective.learningObjective.id;
      const chapter = tree?.chapters.find((entry) => entry.id === objective.learningObjective.chapterId);
      const materials = await getMaterialsForObjective(subject.id, id).catch(() => []);
      const details = await Promise.all(
        materials
          .filter((material) => material.extractionStatus === "done")
          .slice(0, 3)
          .map((material) => getMaterial(material.id).catch(() => null)),
      );
      const linked = details.flatMap((detail) => {
        if (!detail) return [];
        const sectionIds = new Set(
          detail.mappings.filter((mapping) => mapping.learningObjective.id === id).map((mapping) => mapping.sectionId),
        );
        const sections = detail.sections
          .filter((section) => sectionIds.has(section.id))
          .map((section) => [section.heading ?? `Bagian ${section.position}`, section.sourcePage ? `hlm. ${section.sourcePage}` : null].filter(Boolean).join(", "));
        const subchapter = chapter?.subchapters.find((entry) => entry.id === detail.subchapterId);
        return [{ id: detail.id, title: subchapter ? `${detail.title} (${subchapter.name})` : detail.title, sections }];
      });
      return {
        objectiveId: id,
        objectiveNumber: objective.learningObjective.number,
        objectiveDescription: objective.learningObjective.description,
        average,
        location: `Bab ${objective.chapterNumber} · ${objective.chapterName}`,
        materials: linked,
      };
    }),
  );
}

export type RemedialHistoryRow = {
  assessment: Assessment;
  averageChange: number | null;
  compared: number;
  mastered: number;
  finals: number;
};

// Riwayat Remedial: every published remedial assessment against the chosen source.
export async function getRemedialHistory(sourceResults: AssessmentResults | null, remedials: Assessment[]): Promise<RemedialHistoryRow[]> {
  const published = remedials.filter((assessment) => assessment.status !== "draft");
  return Promise.all(
    published.map(async (assessment) => {
      const results = await getAssessmentResults(assessment.id).catch(() => null);
      const figures =
        sourceResults && results
          ? improvementOf(sourceResults, results)
          : { averageChange: null, compared: 0, mastered: 0, finals: 0 };
      return { assessment, ...figures };
    }),
  );
}
