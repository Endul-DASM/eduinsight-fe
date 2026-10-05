"use server";

import { revalidatePath } from "next/cache";
import { ApiError, isMockMode } from "@/lib/api/client";
import { joinSubject } from "@/lib/api/subjects";
import { validateJoinCode } from "@/lib/join-code";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk bergabung ke kelas.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";
// The backend answered without a known error code, e.g. because it has no join endpoint yet.
const REQUEST_FAILED_MESSAGE = "Permintaan belum dapat diproses oleh server. Coba lagi beberapa saat lagi.";

// "joined" carries a timestamp so the modal can tell two successful joins apart and close each time.
export type JoinSubjectState =
  | { status: "error"; message?: string; codeError?: string; joinCode: string }
  | { status: "joined"; subjectName: string; joinedAt: number }
  | undefined;

export async function joinSubjectAction(_previous: JoinSubjectState, formData: FormData): Promise<JoinSubjectState> {
  const joinCode = String(formData.get("joinCode") ?? "").trim();

  const codeError = validateJoinCode(joinCode);
  if (codeError) return { status: "error", codeError, joinCode };

  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE, joinCode };

  try {
    const subject = await joinSubject(joinCode);
    revalidatePath("/student");
    return { status: "joined", subjectName: subject.name, joinedAt: Date.now() };
  } catch (error) {
    if (!(error instanceof ApiError)) return { status: "error", message: SERVER_UNREACHABLE_MESSAGE, joinCode };
    // A wrong code or an already joined subject comes back with the backend's own message.
    return { status: "error", message: error.code ? error.message : REQUEST_FAILED_MESSAGE, joinCode };
  }
}
