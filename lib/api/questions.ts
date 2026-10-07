import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import type { QuestionPage } from "./types";

// The most the backend returns in one page.
const MAX_PAGE_SIZE = 200;

// GET /subjects/:id/questions — approved Bank Soal questions tagged with any of the competencies (FR-G-043).
export const getQuestionsForCompetencies = cache(
  async (subjectId: string, competencyIds: readonly string[]): Promise<QuestionPage> => {
    if (isMockMode || competencyIds.length === 0) return { items: [], total: 0 };

    const query = new URLSearchParams({ limit: String(MAX_PAGE_SIZE) });
    for (const id of competencyIds) query.append("competencyId", id);
    return apiFetch<QuestionPage>(`/subjects/${encodeURIComponent(subjectId)}/questions?${query}`);
  },
);
