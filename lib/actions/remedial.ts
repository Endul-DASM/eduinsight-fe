"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiError, isMockMode } from "@/lib/api/client";
import type { QuestionCounts } from "@/lib/api/question-sources";
import {
  approveGroup,
  deleteRemedialItem,
  generateRemedialGroups,
  rejectGroup,
  requestOfficialDraft,
  requestPractice,
  setGroupMaterials,
  setGroupStudents,
} from "@/lib/api/remedial";
import type { BloomLevel } from "@/lib/api/types";
import { MAX_AI_QUESTIONS } from "@/lib/assessment-form";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk mengelola remedial.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

export type RemedialActionResult = { status: "saved" } | { status: "error"; message: string };
export type RemedialAiResult = { status: "queued"; jobId: string; assessmentId?: string } | { status: "error"; message: string };

function messageOf(error: unknown): string {
  if (!(error instanceof ApiError) || !error.code) return SERVER_UNREACHABLE_MESSAGE;
  return error.fields ? Object.values(error.fields)[0] : error.message;
}

function refresh(slug: string) {
  revalidatePath(`/${slug}/analysis`);
  revalidatePath(`/${slug}/remedial`);
}

// The slug and ids are bound by the page; they still come from the browser, and the backend checks access.
async function save(slug: string, request: () => Promise<unknown>): Promise<RemedialActionResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await request();
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: messageOf(error) };
  }
  refresh(slug);
  return { status: "saved" };
}

// Kelompokkan siswa (FR-G-101): K-Means on TP scores and misconceptions, with the weak TPs' materials suggested.
export async function generateGroupsAction(slug: string, sourceId: string): Promise<RemedialActionResult> {
  return save(slug, () => generateRemedialGroups(sourceId));
}

// Pindah ke: the target group's new member list, the student included.
export async function setGroupStudentsAction(slug: string, groupId: string, studentIds: string[]): Promise<RemedialActionResult> {
  return save(slug, () => setGroupStudents(groupId, studentIds));
}

export async function setGroupMaterialsAction(slug: string, groupId: string, materialIds: string[]): Promise<RemedialActionResult> {
  return save(slug, () => setGroupMaterials(groupId, materialIds));
}

// ACC (FR-G-104, FR-X-010): the students see the materials and the practice questions from now on.
export async function approveGroupAction(slug: string, groupId: string): Promise<RemedialActionResult> {
  return save(slug, () => approveGroup(groupId));
}

export async function rejectGroupAction(slug: string, groupId: string, note: string): Promise<RemedialActionResult> {
  return save(slug, () => rejectGroup(groupId, note.trim() || null));
}

export async function deleteRemedialItemAction(slug: string, itemId: string): Promise<RemedialActionResult> {
  return save(slug, () => deleteRemedialItem(itemId));
}

async function queue(request: () => Promise<{ jobId: string; assessmentId?: string }>): Promise<RemedialAiResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    return { status: "queued", ...(await request()) };
  } catch (error) {
    unstable_rethrow(error);
    return { status: "error", message: messageOf(error) };
  }
}

// Soal latihan AI (AI-13, FR-G-102): replaces the group's practice questions still waiting for ACC.
export async function practiceAction(groupId: string, count: number, bloomLevel: BloomLevel): Promise<RemedialAiResult> {
  if (count < 1 || count > 10) return { status: "error", message: "Jumlah soal latihan 1–10." };
  return queue(() => requestPractice(groupId, count, bloomLevel));
}

// Draf remedial resmi (AI-14, FR-G-103): AI questions on the weak TPs in the source's draft official remedial.
export async function officialDraftAction(
  sourceId: string,
  counts: QuestionCounts,
  bloomLevel: BloomLevel,
): Promise<RemedialAiResult> {
  const total = counts.pg + counts.benarSalah;
  if (total === 0) return { status: "error", message: "Isi jumlah soal minimal satu." };
  if (total > MAX_AI_QUESTIONS) return { status: "error", message: `Paling banyak ${MAX_AI_QUESTIONS} soal per permintaan.` };
  return queue(() => requestOfficialDraft(sourceId, counts, bloomLevel));
}

// After a job: the groups (or the new draft) are read again.
export async function refreshRemedialAction(slug: string): Promise<void> {
  refresh(slug);
}
