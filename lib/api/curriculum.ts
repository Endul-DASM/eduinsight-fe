import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import type { CurriculumTree } from "./types";

export type LearningObjectiveOption = {
  id: string;
  code: string | null;
  description: string;
  // The CP it belongs to, e.g. "CP-E Bilangan berpangkat (Bilangan)".
  cpLabel: string;
  // The Babs that cover it (FR-G-023), for the Bab filter in Pilih TP.
  chapters: { id: string; label: string }[];
};

function label(node: { code: string | null; description: string }) {
  return node.code ? `${node.code} ${node.description}` : node.description;
}

// GET /subjects/:id/curriculum, flattened to the TPs in curriculum order (for Pilih TP).
export const getLearningObjectives = cache(async (subjectId: string): Promise<LearningObjectiveOption[]> => {
  if (isMockMode) return [];

  const tree = await apiFetch<CurriculumTree>(`/subjects/${encodeURIComponent(subjectId)}/curriculum`);
  const chapters = new Map(tree.chapters.map((chapter) => [chapter.id, { id: chapter.id, label: label(chapter) }]));
  return tree.cps.flatMap((cp) =>
    cp.learningObjectives.map((objective) => ({
      id: objective.id,
      code: objective.code,
      description: objective.description,
      cpLabel: cp.element ? `${label(cp)} (${cp.element})` : label(cp),
      chapters: objective.chapterIds.flatMap((id) => chapters.get(id) ?? []),
    })),
  );
});
