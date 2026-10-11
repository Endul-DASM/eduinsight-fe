import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import type { CurriculumTree } from "./types";

export type LearningObjectiveOption = {
  id: string;
  // TP number, e.g. "1.2" (Bab 1, second TP).
  code: string | null;
  description: string;
  // The CP it belongs to, e.g. "Bilangan (Fase E)".
  cpLabel: string;
  // The Bab that holds it, for the Bab filter in Pilih TP.
  chapters: { id: string; label: string }[];
};

// GET /subjects/:id/curriculum (v3.2). Mock mode has no curriculum.
export const getCurriculum = cache(async (subjectId: string): Promise<CurriculumTree | null> => {
  if (isMockMode) return null;

  return apiFetch<CurriculumTree>(`/subjects/${encodeURIComponent(subjectId)}/curriculum`);
});

// The TPs of final Babs, in curriculum order (for Pilih TP). Draft Babs are left out (FR-G-023).
export const getLearningObjectives = cache(async (subjectId: string): Promise<LearningObjectiveOption[]> => {
  const tree = await getCurriculum(subjectId);
  if (!tree) return [];

  const cps = new Map(tree.cps.map((cp) => [cp.id, `${cp.element} (Fase ${cp.fase})`]));
  return tree.chapters
    .filter((chapter) => chapter.status === "final")
    .flatMap((chapter) =>
      chapter.learningObjectives.map((objective) => ({
        id: objective.id,
        code: objective.number,
        description: objective.description,
        cpLabel: cps.get(objective.cpId) ?? "",
        chapters: [{ id: chapter.id, label: `Bab ${chapter.number} ${chapter.name}` }],
      })),
    );
});
