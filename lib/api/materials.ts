import { cache } from "react";
import { apiFetch, isMockMode } from "./client";
import type { MaterialFormat } from "@/lib/material-file";
import type { LearningObjectiveRef } from "./types";

// Materi (PRD 5.3.2, SRS FR-G-030 – 035).
export type { MaterialFormat };
export type ExtractionStatus = "pending" | "processing" | "done" | "failed";

export type Material = {
  id: string;
  subjectId: string;
  chapterId: string | null;
  subchapterId: string | null;
  title: string;
  originalFilename: string;
  format: MaterialFormat;
  sizeBytes: number;
  extractionStatus: ExtractionStatus;
  extractionError: string | null;
  // Null while the TP mapping is a suggestion: the material is a draft until the teacher confirms it.
  mappingConfirmedAt: string | null;
  visibleToStudents: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MaterialSection = {
  id: string;
  position: number;
  heading: string | null;
  body: string;
  sourcePage: number | null;
};

export type MaterialMapping = {
  id: string;
  sectionId: string;
  learningObjective: LearningObjectiveRef;
  score: number | null;
  matchedKeywords: string[];
  // "rule" is the rule-based suggestion (FR-G-032); "teacher" was added by the teacher.
  origin: "rule" | "teacher";
  confirmed: boolean;
};

// Preview (FR-G-033): what was extracted and how it maps to the TPs.
export type MaterialDetail = Material & { sections: MaterialSection[]; mappings: MaterialMapping[] };

// GET /subjects/:id/materials — Resource Library (FR-G-034). Mock mode has none.
export const getMaterials = cache(async (subjectId: string): Promise<Material[]> => {
  if (isMockMode) return [];
  return apiFetch<Material[]>(`/subjects/${encodeURIComponent(subjectId)}/materials`);
});

// GET /materials/:id
export async function getMaterial(id: string): Promise<MaterialDetail> {
  return apiFetch<MaterialDetail>(`/materials/${encodeURIComponent(id)}`);
}

// POST /subjects/:id/materials — answers 202; extraction runs in the background (poll getMaterial).
export async function uploadMaterial(subjectId: string, form: FormData): Promise<Material> {
  return apiFetch<Material>(`/subjects/${encodeURIComponent(subjectId)}/materials`, { method: "POST", body: form });
}

export type MaterialUpdate = { title?: string; chapterId?: string | null; visibleToStudents?: boolean };

// PATCH /materials/:id
export async function updateMaterial(id: string, input: MaterialUpdate): Promise<Material> {
  return apiFetch<Material>(`/materials/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
}

// PUT /materials/:id/mappings — replaces the suggestions with the teacher's mapping and confirms it.
export async function replaceMappings(
  id: string,
  mappings: { sectionId: string; learningObjectiveId: string }[],
): Promise<MaterialDetail> {
  return apiFetch<MaterialDetail>(`/materials/${encodeURIComponent(id)}/mappings`, {
    method: "PUT",
    body: JSON.stringify({ mappings }),
  });
}

// POST /materials/:id/extract — runs extraction again, e.g. after it failed.
export async function retryExtraction(id: string): Promise<Material> {
  return apiFetch<Material>(`/materials/${encodeURIComponent(id)}/extract`, { method: "POST" });
}

// DELETE /materials/:id
export async function deleteMaterial(id: string): Promise<void> {
  await apiFetch<void>(`/materials/${encodeURIComponent(id)}`, { method: "DELETE" });
}
