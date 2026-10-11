import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import type { CurriculumChapter, CurriculumCp, CurriculumTree, Fase } from "./types";

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

export type OfficialCp = {
  id: string;
  fase: Fase;
  element: string;
  description: string;
  sourceDocument: string;
  // Whether this subject already has it.
  imported: boolean | null;
};

// GET /official-cps — the catalog of official CPs for a Fase (FR-G-025).
export async function getOfficialCps(fase: Fase, subjectId: string): Promise<OfficialCp[]> {
  const query = new URLSearchParams({ fase, subjectId });
  return apiFetch<OfficialCp[]>(`/official-cps?${query}`);
}

// POST /subjects/:id/cps/import — imports official CPs as editable copies; ones already imported are skipped.
export async function importCps(subjectId: string, officialCpIds: string[]): Promise<CurriculumTree> {
  return apiFetch<CurriculumTree>(`/subjects/${encodeURIComponent(subjectId)}/cps/import`, {
    method: "POST",
    body: JSON.stringify({ officialCpIds }),
  });
}

export type CpInput = { code: string | null; element: string; fase: Fase; description: string };

// POST /subjects/:id/cps — Tambah CP Sendiri (FR-G-020).
export async function createCp(subjectId: string, input: CpInput): Promise<CurriculumCp> {
  return apiFetch<CurriculumCp>(`/subjects/${encodeURIComponent(subjectId)}/cps`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// PATCH /cps/:id
export async function updateCp(cpId: string, input: Partial<CpInput>): Promise<CurriculumCp> {
  return apiFetch<CurriculumCp>(`/cps/${encodeURIComponent(cpId)}`, { method: "PATCH", body: JSON.stringify(input) });
}

// DELETE /cps/:id — 409 in_use while a Bab picks the CP (FR-G-022).
export async function deleteCp(cpId: string): Promise<void> {
  await apiFetch<void>(`/cps/${encodeURIComponent(cpId)}`, { method: "DELETE" });
}

// The whole Bab form (FR-G-021, FR-G-023). TPs are numbered in the order sent; an existing TP keeps its id.
export type ChapterInput = {
  number: number;
  name: string;
  notes: string | null;
  status: "draft" | "final";
  cpIds: string[];
  learningObjectives: { id?: string; cpId: string; description: string; keywords: string[] }[];
  subchapters: { id?: string; name: string }[];
};

// POST /subjects/:id/chapters
export async function createChapter(subjectId: string, input: ChapterInput): Promise<CurriculumChapter> {
  return apiFetch<CurriculumChapter>(`/subjects/${encodeURIComponent(subjectId)}/chapters`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// PUT /chapters/:id
export async function updateChapter(chapterId: string, input: ChapterInput): Promise<CurriculumChapter> {
  return apiFetch<CurriculumChapter>(`/chapters/${encodeURIComponent(chapterId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

// DELETE /chapters/:id — removes its TPs and Subbabs; 409 in_use when a TP is used (FR-G-022).
export async function deleteChapter(chapterId: string): Promise<void> {
  await apiFetch<void>(`/chapters/${encodeURIComponent(chapterId)}`, { method: "DELETE" });
}

// POST /subjects/:id/curriculum/copy — FR-G-024, only into an empty curriculum (409 curriculum_not_empty).
export async function copyCurriculum(subjectId: string, sourceSubjectId: string): Promise<CurriculumTree> {
  return apiFetch<CurriculumTree>(`/subjects/${encodeURIComponent(subjectId)}/curriculum/copy`, {
    method: "POST",
    body: JSON.stringify({ sourceSubjectId }),
  });
}
