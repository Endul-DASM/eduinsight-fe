// Edit Profile (Figma New Design 187:10583). Pure checks shared by the form and its Server Functions (PATCH /me); the
// email is read-only there, and the password has its own form.
import { validateName } from "./auth/validation";
import { isProvince } from "./provinces";

export type ProfileValues = { name: string; province: string };
export type ProfileErrors = Partial<Record<keyof ProfileValues, string>>;

export function validateProfile(values: ProfileValues): ProfileErrors {
  const errors: ProfileErrors = {
    name: validateName(values.name.trim()),
    // Optional.
    province: values.province && !isProvince(values.province) ? "Pilih provinsi dari daftar." : undefined,
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as ProfileErrors;
}

// "Minimal 800 x 800. JPG atau PNG", the same limits as PUT /me/photo.
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

// GET /me/photo through app/api/me/photo; null without a photo, so the initials show instead.
export function profilePhotoUrl(photoUpdatedAt: string | null): string | null {
  return photoUpdatedAt ? `/api/me/photo?v=${encodeURIComponent(photoUpdatedAt)}` : null;
}
