import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import type { QuestionPage } from "./types";

// The most the backend returns in one page.
const MAX_PAGE_SIZE = 200;

// GET /subjects/:id/questions — approved Bank Soal questions tagged with any of the TPs (FR-G-043).
export const getQuestionsForLearningObjectives = cache(
  async (subjectId: string, learningObjectiveIds: readonly string[]): Promise<QuestionPage> => {
    if (isMockMode || learningObjectiveIds.length === 0) return { items: [], total: 0 };

    const query = new URLSearchParams({ limit: String(MAX_PAGE_SIZE) });
    for (const id of learningObjectiveIds) query.append("learningObjectiveId", id);
    return apiFetch<QuestionPage>(`/subjects/${encodeURIComponent(subjectId)}/questions?${query}`);
  },
);
