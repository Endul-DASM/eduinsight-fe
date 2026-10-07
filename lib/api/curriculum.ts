import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import type { CurriculumTree } from "./types";

export type CompetencyOption = {
  id: string;
  code: string | null;
  description: string;
  // Where it sits in the curriculum, e.g. "Bab 1 Eksponen › 1.1 Sifat Eksponen".
  path: string;
  indicatorCount: number;
};

function label(node: { code: string | null; description: string }) {
  return node.code ? `${node.code} ${node.description}` : node.description;
}

// GET /subjects/:id/curriculum, flattened to the competencies in curriculum order (for Pilih Kompetensi).
export const getCompetencies = cache(async (subjectId: string): Promise<CompetencyOption[]> => {
  if (isMockMode) return [];

  const tree = await apiFetch<CurriculumTree>(`/subjects/${encodeURIComponent(subjectId)}/curriculum`);
  return tree.cps.flatMap((cp) =>
    cp.learningObjectives.flatMap((objective) =>
      objective.chapters.flatMap((chapter) =>
        chapter.subchapters.flatMap((subchapter) =>
          subchapter.competencies.map((competency) => ({
            id: competency.id,
            code: competency.code,
            description: competency.description,
            path: `${label(chapter)} › ${label(subchapter)}`,
            indicatorCount: competency.indicators.length,
          })),
        ),
      ),
    ),
  );
});
