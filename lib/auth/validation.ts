// Sign-up rules and messages from SRS 6.1.1. Used by the forms and again by the Server Functions.

export const USERNAME_MESSAGE = "Username 3–30 karakter, hanya huruf kecil, angka, titik, atau garis bawah.";
export const EMAIL_MESSAGE = "Format email tidak valid.";
export const PASSWORD_MESSAGE = "Kata sandi minimal 8 dan maksimal 72 karakter.";
export const PASSWORD_CONFIRMATION_MESSAGE = "Konfirmasi kata sandi tidak sama.";
// Shown for every failed sign-in so it never reveals whether an email or username exists.
export const INVALID_CREDENTIALS_MESSAGE = "Email/username atau kata sandi salah.";

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type RegisterValues = {
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

export type RegisterField = keyof RegisterValues;

export type FieldErrors = Partial<Record<RegisterField, string>>;

export function validateUsername(username: string): string | undefined {
  return USERNAME_PATTERN.test(username) ? undefined : USERNAME_MESSAGE;
}

export function validateEmail(email: string): string | undefined {
  return email.length <= 255 && EMAIL_PATTERN.test(email) ? undefined : EMAIL_MESSAGE;
}

export function validatePassword(password: string): string | undefined {
  return password.length >= 8 && password.length <= 72 ? undefined : PASSWORD_MESSAGE;
}

export function validatePasswordConfirmation(password: string, confirmation: string): string | undefined {
  return password === confirmation ? undefined : PASSWORD_CONFIRMATION_MESSAGE;
}

export function validateRegister(values: RegisterValues): FieldErrors {
  const errors: FieldErrors = {
    username: validateUsername(values.username),
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
    .slice(0, 30);
}
