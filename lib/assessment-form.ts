// Shared by the assessment wizard (client) and its Server Functions.

import type { AssessmentMode, AssessmentStatus, AssessmentType } from "@/lib/api/types";

export const assessmentTypeLabels: Record<AssessmentType, string> = {
  pre_test: "Pre-test",
  post_test: "Post-test",
  ulangan_harian: "Ulangan Harian",
  uts: "UTS",
  uas: "UAS",
  remedial: "Remedial",
};

export const assessmentStatusLabels: Record<AssessmentStatus, string> = {
  draft: "Draf",
  scheduled: "Terjadwal",
  ongoing: "Berlangsung",
  closed: "Selesai",
};

export const assessmentModeLabels: Record<AssessmentMode, string> = {
  daring: "Daring",
  luring: "Luring",
};

export const assessmentTypes = Object.keys(assessmentTypeLabels) as AssessmentType[];
export const assessmentStatuses = Object.keys(assessmentStatusLabels) as AssessmentStatus[];

export function isAssessmentType(value: unknown): value is AssessmentType {
  return typeof value === "string" && value in assessmentTypeLabels;
}

export function isAssessmentStatus(value: unknown): value is AssessmentStatus {
  return typeof value === "string" && value in assessmentStatusLabels;
}

// Wizard steps (PRD 5.4.2), in order. The step is kept in the URL: /{slug}/assessment/{id}?step=soal.
export const wizardSteps = [
  { id: "informasi", label: "Informasi" },
  { id: "kompetensi", label: "Pilih Kompetensi" },
  { id: "soal", label: "Pilih Soal" },
  { id: "pengaturan", label: "Pengaturan" },
] as const;

export type WizardStep = (typeof wizardSteps)[number]["id"];

export function wizardStepOf(value: unknown): WizardStep {
  return wizardSteps.find((step) => step.id === value)?.id ?? "informasi";
}

export function nextWizardStep(step: WizardStep): WizardStep | null {
  const index = wizardSteps.findIndex((item) => item.id === step);
  return wizardSteps[index + 1]?.id ?? null;
}

// Schedules are entered and shown in WIB. A datetime-local input has no time zone, and the page is rendered on the
// server, so a fixed zone keeps the server and the browser in agreement. Schools in WITA/WIT are a follow-up.
export const SCHEDULE_TIME_ZONE = "Asia/Jakarta";
const SCHEDULE_OFFSET = "+07:00";

// "2026-11-01T07:00" (WIB) → "2026-11-01T07:00:00+07:00".
export function wibInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const iso = `${value}:00${SCHEDULE_OFFSET}`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

// An ISO time from the backend → "2026-11-01T07:00" in WIB, for a datetime-local input.
export function isoToWibInput(iso: string | null): string {
  if (!iso) return "";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: SCHEDULE_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

const scheduleFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: SCHEDULE_TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// "1 Nov 2026, 07.00 WIB".
export function formatSchedule(iso: string | null): string {
  return iso ? `${scheduleFormat.format(new Date(iso))} WIB` : "Belum dijadwalkan";
}

// Informasi (FR-G-041).

export type InformationValues = {
  title: string;
  type: string;
  kkm: string;
  opensAt: string;
  closesAt: string;
};

export type InformationErrors = Partial<Record<keyof InformationValues, string>>;

export function validateInformation(values: InformationValues): InformationErrors {
  const errors: InformationErrors = {};

  if (!values.title || values.title.length > 200) errors.title = "Judul asesmen 1–200 karakter.";
  if (!isAssessmentType(values.type)) errors.type = "Pilih jenis asesmen.";
  if (values.kkm && !isScore(values.kkm)) errors.kkm = "KKM berupa angka 0–100.";

  const opensAt = values.opensAt ? wibInputToIso(values.opensAt) : null;
  const closesAt = values.closesAt ? wibInputToIso(values.closesAt) : null;
  if (values.opensAt && !opensAt) errors.opensAt = "Format jadwal buka tidak valid.";
  if (values.closesAt && !closesAt) errors.closesAt = "Format jadwal tutup tidak valid.";
  if (opensAt && closesAt && Date.parse(closesAt) <= Date.parse(opensAt)) {
    errors.closesAt = "Jadwal tutup harus setelah jadwal buka.";
  }

  return errors;
}

// Pengaturan (FR-G-044).

export type SettingsValues = {
  durationMinutes: string;
  maxAttempts: string;
  mode: string;
  remedialThreshold: string;
};

export type SettingsErrors = Partial<Record<keyof SettingsValues, string>>;

export function validateSettings(values: SettingsValues): SettingsErrors {
  const errors: SettingsErrors = {};

  if (values.durationMinutes && !isWhole(values.durationMinutes, 1, 600)) {
    errors.durationMinutes = "Durasi 1–600 menit.";
  }
  if (!isWhole(values.maxAttempts, 1, 10)) errors.maxAttempts = "Jumlah percobaan 1–10.";
  if (values.mode !== "daring" && values.mode !== "luring") errors.mode = "Pilih mode asesmen.";
  if (values.remedialThreshold && !isScore(values.remedialThreshold)) {
    errors.remedialThreshold = "Ambang remedial berupa angka 0–100.";
  }

  return errors;
}

function isScore(value: string) {
  return isWhole(value, 0, 100);
}

function isWhole(value: string, min: number, max: number) {
  if (!/^\d+$/.test(value)) return false;
  const number = Number(value);
  return number >= min && number <= max;
}
