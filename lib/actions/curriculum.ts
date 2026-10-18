"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiError, isMockMode } from "@/lib/api/client";
import {
  type ChapterInput,
  type CpInput,
  createChapter,
  createCp,
  deleteChapter,
  deleteCp,
  getOfficialCps,
  importCps,
  type OfficialCp,
  updateChapter,
  updateCp,
} from "@/lib/api/curriculum";
import type { Fase } from "@/lib/api/types";
import { validateChapter, validateCp } from "@/lib/curriculum-form";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk menyimpan kurikulum.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

// Called directly from the curriculum page's client components, which keep the form state themselves.
export type CurriculumActionResult =
  | { status: "saved" }
  | { status: "error"; message?: string; fields?: Record<string, string> };

function failure(error: unknown): CurriculumActionResult {
  if (error instanceof ApiError && error.code) {
    // Field errors come with the message too; show it once, next to its field when the form has one.
    return { status: "error", message: error.fields ? undefined : error.message, fields: error.fields };
  }
  return { status: "error", message: SERVER_UNREACHABLE_MESSAGE };
}

// The curriculum feeds Pilih TP and the dashboard's Diagnosis Cepat TP as well.
function refresh(slug: string) {
  revalidatePath(`/${slug}/curriculum`);
  revalidatePath(`/${slug}/dashboard`);
}

async function run(slug: string, request: () => Promise<unknown>): Promise<CurriculumActionResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await request();
  } catch (error) {
    // An expired session makes apiFetch redirect to sign in, which works by throwing; let it through.
    unstable_rethrow(error);
    return failure(error);
  }
  refresh(slug);
  return { status: "saved" };
}

export async function listOfficialCpsAction(
  subjectId: string,
  fase: Fase,
): Promise<{ status: "ok"; cps: OfficialCp[] } | { status: "error"; message: string }> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    return { status: "ok", cps: await getOfficialCps(fase, subjectId) };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: error instanceof ApiError && error.code ? error.message : SERVER_UNREACHABLE_MESSAGE };
  }
}

// FR-G-025: imports the chosen official CPs.
export async function importCpsAction(
  slug: string,
  subjectId: string,
  officialCpIds: string[],
): Promise<CurriculumActionResult> {
  if (officialCpIds.length === 0) return { status: "error", message: "Pilih minimal satu CP." };
  return run(slug, () => importCps(subjectId, officialCpIds));
}

// FR-G-020: Tambah CP Sendiri (cpId null) or edit a CP.
export async function saveCpAction(
  slug: string,
  subjectId: string,
  cpId: string | null,
  input: CpInput,
): Promise<CurriculumActionResult> {
  const fields = validateCp(input);
  if (Object.keys(fields).length > 0) return { status: "error", fields };
  return run(slug, () => (cpId ? updateCp(cpId, input) : createCp(subjectId, input)));
}

export async function deleteCpAction(slug: string, cpId: string): Promise<CurriculumActionResult> {
  return run(slug, () => deleteCp(cpId));
}

// FR-G-021, FR-G-023: the whole Bab form; chapterId null creates it.
export async function saveChapterAction(
  slug: string,
  subjectId: string,
  chapterId: string | null,
  input: ChapterInput,
  takenNumbers: number[],
): Promise<CurriculumActionResult> {
  const fields = validateChapter(input, takenNumbers);
  if (Object.keys(fields).length > 0) return { status: "error", fields };
  return run(slug, () => (chapterId ? updateChapter(chapterId, input) : createChapter(subjectId, input)));
}

export async function deleteChapterAction(slug: string, chapterId: string): Promise<CurriculumActionResult> {
  return run(slug, () => deleteChapter(chapterId));
}
