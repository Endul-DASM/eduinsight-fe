"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiError, isMockMode } from "@/lib/api/client";
import { getSubjects, joinSubject, leaveSubject } from "@/lib/api/subjects";
import { validateJoinCode } from "@/lib/join-code";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk bergabung ke kelas.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";
// The backend answered without a known error code, e.g. because it has no join endpoint yet.
const REQUEST_FAILED_MESSAGE = "Permintaan belum dapat diproses oleh server. Coba lagi beberapa saat lagi.";

// "joined" carries a timestamp so the modal can tell two successful joins apart and close each time.
// alreadyJoined: the student was in the subject before, which the backend also answers with success (UAT MAPEL-U03).
export type JoinSubjectState =
  | { status: "error"; message?: string; codeError?: string; joinCode: string }
  | { status: "joined"; subjectName: string; alreadyJoined: boolean; joinedAt: number }
  | undefined;

export async function joinSubjectAction(_previous: JoinSubjectState, formData: FormData): Promise<JoinSubjectState> {
  const joinCode = String(formData.get("joinCode") ?? "").trim();

  const codeError = validateJoinCode(joinCode);
  if (codeError) return { status: "error", codeError, joinCode };

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE, joinCode };

  try {
    const before = await getSubjects();
    const subject = await joinSubject(joinCode);
    revalidatePath("/student");
    return {
      status: "joined",
      subjectName: subject.name,
      alreadyJoined: before.some((entry) => entry.id === subject.id),
      joinedAt: Date.now(),
    };
  } catch (error) {
    // An expired session makes apiFetch redirect to sign in, which works by throwing; let it through.
    unstable_rethrow(error);
    if (!(error instanceof ApiError)) return { status: "error", message: SERVER_UNREACHABLE_MESSAGE, joinCode };
    // A wrong code or an already joined subject comes back with the backend's own message.
    return { status: "error", message: error.code ? error.message : REQUEST_FAILED_MESSAGE, joinCode };
  }
}

export type LeaveSubjectState = { status: "error"; message: string } | { status: "left" };

// Pilih Mapel: the student leaves a subject themselves (UAT MAPEL-H05, MAPEL-U02).
export async function leaveSubjectAction(subjectId: string): Promise<LeaveSubjectState> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await leaveSubject(subjectId);
  } catch (error) {
    unstable_rethrow(error);
    if (!(error instanceof ApiError)) return { status: "error", message: SERVER_UNREACHABLE_MESSAGE };
    return { status: "error", message: error.code ? error.message : REQUEST_FAILED_MESSAGE };
  }
  revalidatePath("/student");
  return { status: "left" };
}
