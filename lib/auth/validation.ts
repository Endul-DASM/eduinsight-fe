// Sign-up rules and messages from SRS 6.1.1. Used by the forms and again by the Server Functions.

export const USERNAME_MESSAGE =
  "Username 3–30 karakter, hanya huruf kecil, angka, titik, atau garis bawah, dan tidak diawali angka.";
export const USERNAME_DIGIT_START_MESSAGE = "Username tidak boleh diawali angka.";
export const NAME_MESSAGE = "Nama wajib diisi, maksimal 120 karakter.";
export const EMAIL_MESSAGE = "Format email tidak valid.";
export const PASSWORD_LENGTH_MESSAGE = "Kata sandi harus 8–20 karakter.";
// Any letter and any digit; upper or lower case does not matter.
export const PASSWORD_MIX_MESSAGE = "Kata sandi harus berisi gabungan huruf dan angka.";
export const PASSWORD_CONFIRMATION_MESSAGE = "Konfirmasi kata sandi tidak sama.";
// Shown for every failed sign-in so it never reveals whether an email or username exists.
export const INVALID_CREDENTIALS_MESSAGE = "Email/username atau kata sandi salah.";

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterValues = {
  username: string;
  // Full name; the navbar shows its first word.
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type RegisterField = keyof RegisterValues;

export type FieldErrors = Partial<Record<RegisterField, string>>;

export function validateUsername(username: string): string | undefined {
  // Checked first, so "1" or "1 siti" gets the specific message too.
  if (/^[0-9]/.test(username)) return USERNAME_DIGIT_START_MESSAGE;
  return USERNAME_PATTERN.test(username) ? undefined : USERNAME_MESSAGE;
}

// users.name in the backend holds up to 120 characters.
export function validateName(name: string): string | undefined {
  return name.length > 0 && name.length <= 120 ? undefined : NAME_MESSAGE;
}

export function validateEmail(email: string): string | undefined {
  return email.length <= 255 && EMAIL_PATTERN.test(email) ? undefined : EMAIL_MESSAGE;
}

export function validatePassword(password: string): string | undefined {
  if (password.length < 8 || password.length > 20) return PASSWORD_LENGTH_MESSAGE;
  return /\p{L}/u.test(password) && /\p{Nd}/u.test(password) ? undefined : PASSWORD_MIX_MESSAGE;
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | undefined {
  return password === confirmation ? undefined : PASSWORD_CONFIRMATION_MESSAGE;
}

export function validateRegister(values: RegisterValues): FieldErrors {
  const errors: FieldErrors = {
    username: validateUsername(values.username),
    name: validateName(values.name),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    passwordConfirmation: validatePasswordConfirmation(values.password, values.passwordConfirmation),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as FieldErrors;
}

// Google gives no username, so the sign-up screen suggests one from the part of the email before "@".
export function suggestUsername(email: string): string {
  return email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "")
    // A username cannot start with a digit.
    .replace(/^[0-9]+/, "")
    .slice(0, 30);
}
