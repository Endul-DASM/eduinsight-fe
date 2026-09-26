"use server";

import { redirect } from "next/navigation";
import { ApiError, apiFetch } from "@/lib/api/client";
import { clearSessionToken, setSessionToken } from "@/lib/api/session";
import type { LoginResponse, UserRole } from "@/lib/api/types";

export type LoginState = { error: string; email: string } | undefined;

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email dan kata sandi wajib diisi.", email };
  }

  let role: UserRole;
  try {
    const result = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      withSession: false,
    });
    await setSessionToken(result.accessToken);
    role = result.user.role;
  } catch (error) {
    const message =
      error instanceof ApiError && error.status === 401
        ? error.message
        : "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";
    return { error: message, email };
  }

  // Admins manage subjects from the same screen as teachers.
  redirect(role === "siswa" ? "/student/dashboard" : "/choose-subject");
}

export async function logout() {
  await clearSessionToken();
  redirect("/login");
}
