import { type AuthRole, authRoles } from "./roles";

// A message shown above an auth form. wrongRole adds a link to that role's sign-in page.
export type AuthNotice = {
  message: string;
  wrongRole?: AuthRole;
};

export const SERVER_UNREACHABLE_MESSAGE = "Tidak dapat terhubung ke server. Coba lagi beberapa saat lagi.";
// The server answered without a known error code, e.g. an endpoint it does not offer yet.
export const REQUEST_FAILED_MESSAGE = "Permintaan belum dapat diproses oleh server. Coba lagi beberapa saat lagi.";
export const MOCK_MODE_MESSAGE = "Mode demo: sambungkan backend (API_BASE_URL) untuk mendaftar atau masuk dengan Google.";

// FR-X-001: the credentials are right, but the account belongs on the other role's page.
export function wrongRoleNotice(accountRole: AuthRole): AuthNotice {
  return { message: `Akun ini terdaftar sebagai ${authRoles[accountRole].label}.`, wrongRole: accountRole };
}

// Error codes the Google routes put in ?error= when they send the user back (IF-SW-05).
const errorMessages: Record<string, string> = {
  google_unavailable: "Masuk dengan Google belum tersedia. Silakan gunakan email dan kata sandi.",
  google_failed: "Gagal masuk dengan Google. Silakan coba lagi atau gunakan email dan kata sandi.",
  google_cancelled: "Masuk dengan Google dibatalkan.",
  signup_expired: "Sesi pendaftaran dengan Google sudah berakhir. Silakan ulangi.",
};

export function noticeForError(code: string | string[] | undefined, role: AuthRole): AuthNotice | undefined {
  if (typeof code !== "string") return undefined;
  if (code === "wrong_role") return wrongRoleNotice(role === "teacher" ? "student" : "teacher");
  const message = errorMessages[code];
  return message ? { message } : undefined;
}
