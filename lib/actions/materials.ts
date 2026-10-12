"use server";

import { revalidatePath } from "next/cache";
import { ApiError, isMockMode } from "@/lib/api/client";
import {
  deleteMaterial,
  getMaterial,
  type Material,
  type MaterialDetail,
  replaceMappings,
  retryExtraction,
  updateMaterial,
  uploadMaterial,
} from "@/lib/api/materials";
import { fileProblem } from "@/lib/material-file";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk mengunggah materi.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

export type MaterialActionResult = { status: "saved" } | { status: "error"; message: string };

function messageOf(error: unknown): string {
  if (error instanceof ApiError && error.code) return Object.values(error.fields ?? {})[0] ?? error.message;
  return SERVER_UNREACHABLE_MESSAGE;
}

function refresh(slug: string) {
  revalidatePath(`/${slug}/curriculum`);
}

// FR-G-030: sends the file; extraction (FR-G-031) then runs in the background.
export async function uploadMaterialAction(
  slug: string,
  subjectId: string,
  form: FormData,
): Promise<{ status: "ok"; material: Material } | { status: "error"; message: string }> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  const file = form.get("file");
  if (!(file instanceof File)) return { status: "error", message: "Pilih berkas materi." };
  const problem = fileProblem(file);
  if (problem) return { status: "error", message: problem };
  try {
    const material = await uploadMaterial(subjectId, form);
    refresh(slug);
    return { status: "ok", material };
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
}

// For polling the extraction and for the material modal.
export async function getMaterialAction(
  id: string,
): Promise<{ status: "ok"; material: MaterialDetail } | { status: "error"; message: string }> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    return { status: "ok", material: await getMaterial(id) };
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
}

// The TPs the teacher picked become the confirmed mapping (FR-G-032): each TP keeps the sections the system
// suggested for it, and a TP without a suggestion is linked to every section.
function mappingsFor(material: MaterialDetail, objectiveIds: string[]) {
  return objectiveIds.flatMap((objectiveId) => {
    const suggested = material.mappings
      .filter((mapping) => mapping.learningObjective.id === objectiveId)
      .map((mapping) => mapping.sectionId);
    const sections = suggested.length > 0 ? suggested : material.sections.map((section) => section.id);
    return [...new Set(sections)].map((sectionId) => ({ sectionId, learningObjectiveId: objectiveId }));
  });
}

// "Simpan Draft" saves the title and Bab only; "Upload Materi" / "Simpan" also confirms the TP mapping.
export async function saveMaterialAction(
  slug: string,
  id: string,
  input: { title: string; chapterId: string | null; objectiveIds: string[]; confirm: boolean },
): Promise<MaterialActionResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  const title = input.title.trim();
  if (!title || title.length > 200) return { status: "error", message: "Judul materi wajib diisi, maksimal 200 karakter." };
  if (input.confirm && input.objectiveIds.length === 0) return { status: "error", message: "Pilih minimal satu TP." };
  try {
    await updateMaterial(id, { title, chapterId: input.chapterId });
    if (input.confirm) {
      const material = await getMaterial(id);
      if (material.extractionStatus !== "done") {
        return { status: "error", message: "Materi masih diproses. Tunggu ekstraksi selesai sebelum memetakan TP." };
      }
      await replaceMappings(id, mappingsFor(material, input.objectiveIds));
    }
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
  refresh(slug);
  return { status: "saved" };
}

// FR-G-035: whether students see the material.
export async function setVisibilityAction(slug: string, id: string, visible: boolean): Promise<MaterialActionResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await updateMaterial(id, { visibleToStudents: visible });
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
  refresh(slug);
  return { status: "saved" };
}

export async function retryExtractionAction(slug: string, id: string): Promise<MaterialActionResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await retryExtraction(id);
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
  refresh(slug);
  return { status: "saved" };
}

export async function deleteMaterialAction(slug: string, id: string): Promise<MaterialActionResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await deleteMaterial(id);
  } catch (error) {
    return { status: "error", message: messageOf(error) };
  }
  refresh(slug);
  return { status: "saved" };
}
