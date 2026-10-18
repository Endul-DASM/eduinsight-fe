// Edit Profile (Figma New Design 187:10583). Pure checks shared by the form; the backend has no profile update yet (the password's own form validates on the server).
import { validateEmail, validateName } from "./auth/validation";
import { isProvince } from "./provinces";

export type ProfileValues = { name: string; email: string; province: string };
export type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

export function validateProfile(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {
    name: validateName(values.name.trim()),
    email: validateEmail(values.email.trim()),
    // Optional.
    province: values.province && !isProvince(values.province) ? "Pilih provinsi dari daftar." : undefined,
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as ProfileErrors;
}

// "Minimal 800 x 800. JPG atau PNG"; the size cap keeps the upload reasonable once the backend accepts it.
export const PHOTO_MIN_SIZE = 800;
export const PHOTO_MAX_MB = 5;
const PHOTO_TYPES = ["image/jpeg", "image/png"];

export function validatePhotoFile(file: File): string | undefined {
  if (!PHOTO_TYPES.includes(file.type)) return "Foto harus berformat JPG atau PNG.";
  if (file.size > PHOTO_MAX_MB * 1024 * 1024) return `Ukuran foto maksimal ${PHOTO_MAX_MB} MB.`;
  return undefined;
}

export function validatePhotoSize(width: number, height: number): string | undefined {
  return width >= PHOTO_MIN_SIZE && height >= PHOTO_MIN_SIZE
    ? undefined
    : `Foto minimal ${PHOTO_MIN_SIZE} x ${PHOTO_MIN_SIZE} piksel (foto ini ${width} x ${height}).`;
}
