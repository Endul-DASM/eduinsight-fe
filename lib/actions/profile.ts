"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { ApiError, isMockMode } from "@/lib/api/client";
import { deleteProfilePhoto, updateProfile, uploadProfilePhoto } from "@/lib/api/users";
import { type ProfileErrors, type ProfileValues, validatePhotoFile, validateProfile } from "@/lib/profile-form";

const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk menyimpan profil.";
const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";

export type ProfileActionResult = { status: "saved" } | { status: "error"; message: string; fields?: ProfileErrors };

function errorOf(error: unknown): ProfileActionResult {
  if (error instanceof ApiError && error.code) {
    const fields = (error.fields ?? {}) as ProfileErrors & { file?: string };
    return { status: "error", message: fields.file ?? Object.values(fields)[0] ?? error.message, fields };
  }
  return { status: "error", message: SERVER_UNREACHABLE_MESSAGE };
}

// Every page shows the name and photo in the top bar.
function refresh() {
  revalidatePath("/", "layout");
}

async function run(request: () => Promise<unknown>): Promise<ProfileActionResult> {
  if (isMockMode) return { status: "error", message: MOCK_MODE_MESSAGE };
  try {
    await request();
  } catch (error) {
    // An expired session makes apiFetch redirect to sign in, which works by throwing; let it through.
    unstable_rethrow(error);
    return errorOf(error);
  }
  refresh();
  return { status: "saved" };
}

// Personal Info: PATCH /me with the name and province (empty clears it).
export async function saveProfileAction(values: ProfileValues): Promise<ProfileActionResult> {
  const fields = validateProfile(values);
  if (Object.keys(fields).length > 0) return { status: "error", message: "Periksa lagi isian profil.", fields };
  return run(() => updateProfile({ name: values.name.trim(), province: values.province || null }));
}

// Foto profil: PUT /me/photo. The size in pixels is checked in the browser and again by the backend.
export async function uploadPhotoAction(form: FormData): Promise<ProfileActionResult> {
  const file = form.get("file");
  if (!(file instanceof File)) return { status: "error", message: "Pilih foto profil." };
  const problem = validatePhotoFile(file);
  if (problem) return { status: "error", message: problem };
  return run(() => uploadProfilePhoto(form));
}

// DELETE /me/photo: back to the initials.
export async function deletePhotoAction(): Promise<ProfileActionResult> {
  return run(() => deleteProfilePhoto());
}
