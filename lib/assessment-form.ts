// Shared by the Buat Asesmen pages (client) and their Server Functions.

import type { AssessmentMode, AssessmentStatus, AssessmentType, BloomLevel, QuestionType } from "@/lib/api/types";

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

// Buat Asesmen (PRD 5.4.2; Figma New Design 60:4158). The method only lives in the URL, the backend does not store
// it: /{slug}/assessment/{id}?method=ketik&step=soal.
export const builderMethods = {
  ai: { title: "Buat Soal dengan AI Generated", crumbs: ["Buat Soal (AI Generated)"], questionsStep: "Pembuatan Soal" },
  ketik: { title: "Buat Soal Manual", crumbs: ["Buat Soal Manual", "Ketik di EduInsight"], questionsStep: "Pembuatan Soal" },
  template: { title: "Buat Soal Manual", crumbs: ["Buat Soal Manual", "Template"], questionsStep: "Detail Soal" },
  ocr: { title: "Buat Soal dengan Scan OCR", crumbs: ["Buat Soal Scan OCR"], questionsStep: "Detail Soal" },
} as const;

export type BuilderMethod = keyof typeof builderMethods;

export function builderMethodOf(value: unknown): BuilderMethod {
  return typeof value === "string" && value in builderMethods ? (value as BuilderMethod) : "ketik";
}

// "selesai" is the "Asesmen Berhasil Dipublikasi!" screen after the three steps.
export const builderSteps = ["spesifikasi", "soal", "review", "selesai"] as const;
export type BuilderStep = (typeof builderSteps)[number];

export function builderStepOf(value: unknown): BuilderStep {
  return builderSteps.find((step) => step === value) ?? "spesifikasi";
}

export function builderPath(slug: string, assessmentId: string, method: BuilderMethod, step: BuilderStep) {
  return `/${slug}/assessment/${assessmentId}?method=${method}&step=${step}`;
}

export const MIN_LEARNING_OBJECTIVE_MESSAGE = "Pilih minimal satu TP.";

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

// Spesifikasi Soal (FR-G-041, FR-G-042, FR-G-044): Informasi, Pilih TP and Pengaturan on one page.

export type SpecificationValues = {
  title: string;
  type: string;
  objectiveIds: string[];
  // Durasi Pengerjaan as jam : menit.
  hours: string;
  minutes: string;
  mode: string;
  opensAt: string;
  closesAt: string;
  kkm: string;
  maxAttempts: string;
  remedialThreshold: string;
};

export type SpecificationErrors = Partial<Record<keyof SpecificationValues, string>>;

export const MAX_DURATION_MINUTES = 600;

// Null when both parts are empty; NaN when they are not a valid duration.
export function durationOf(hours: string, minutes: string): number | null {
  if (!hours.trim() && !minutes.trim()) return null;
  const h = hours.trim() || "0";
  const m = minutes.trim() || "0";
  if (!/^\d+$/.test(h) || !/^\d+$/.test(m) || Number(m) > 59) return Number.NaN;
  return Number(h) * 60 + Number(m);
}

export function durationParts(total: number | null): { hours: string; minutes: string } {
  if (total === null) return { hours: "", minutes: "" };
  return { hours: String(Math.floor(total / 60)), minutes: String(total % 60).padStart(2, "0") };
}

// "Simpan Draft" only needs what the backend needs to create the draft (title and type); "Selanjutnya" also needs
// everything publishing will ask for, so the teacher finds out here and not at the last step.
export function validateSpecification(values: SpecificationValues, complete: boolean): SpecificationErrors {
  const errors: SpecificationErrors = {};

  if (!values.title || values.title.length > 200) errors.title = "Judul asesmen 1–200 karakter.";
  if (!isAssessmentType(values.type)) errors.type = "Pilih jenis asesmen.";

  const duration = durationOf(values.hours, values.minutes);
  if (duration !== null && !(duration >= 1 && duration <= MAX_DURATION_MINUTES)) {
    errors.hours = `Durasi 1 menit sampai ${MAX_DURATION_MINUTES / 60} jam.`;
  }
  if (values.mode && values.mode !== "daring" && values.mode !== "luring") errors.mode = "Pilih mode asesmen.";
  if (values.kkm && !isScore(values.kkm)) errors.kkm = "KKM berupa angka 0–100.";
  if (!isWhole(values.maxAttempts, 1, 10)) errors.maxAttempts = "Jumlah percobaan 1–10.";
  if (values.remedialThreshold && !isScore(values.remedialThreshold)) {
    errors.remedialThreshold = "Ambang remedial berupa angka 0–100.";
  }

  const opensAt = values.opensAt ? wibInputToIso(values.opensAt) : null;
  const closesAt = values.closesAt ? wibInputToIso(values.closesAt) : null;
  if (values.opensAt && !opensAt) errors.opensAt = "Format jadwal buka tidak valid.";
  if (values.closesAt && !closesAt) errors.closesAt = "Format jadwal tutup tidak valid.";
  if (opensAt && closesAt && Date.parse(closesAt) <= Date.parse(opensAt)) {
    errors.closesAt = "Jadwal tutup harus setelah jadwal buka.";
  }

  if (complete) {
    if (values.objectiveIds.length === 0) errors.objectiveIds = MIN_LEARNING_OBJECTIVE_MESSAGE;
    if (duration === null) errors.hours = "Durasi pengerjaan wajib diisi.";
    if (!values.mode) errors.mode = "Pilih mode asesmen.";
    if (!values.opensAt) errors.opensAt = "Jadwal buka wajib diisi.";
    if (!values.closesAt) errors.closesAt = "Jadwal tutup wajib diisi.";
  }

  return errors;
}

// Jenis soal (Figma 60:4677). The backend and SRS DR-07 only know pilihan ganda and uraian; the others wait for both.
export const questionTypeOptions = [
  { value: "pg", label: "Pilihan Ganda", enabled: true },
  { value: "benar_salah", label: "Benar/Salah", enabled: false },
  { value: "isian_singkat", label: "Isian Singkat", enabled: false },
  { value: "pg_kompleks", label: "Pilihan Ganda Kompleks", enabled: false },
  { value: "pilihan_majemuk", label: "Pilihan Majemuk", enabled: false },
  { value: "uraian", label: "Essay", enabled: true },
] as const;

export const questionTypeLabels: Record<QuestionType, string> = { pg: "Pilihan Ganda", uraian: "Essay" };

export const bloomLevels = [
  { value: "C1", label: "Mengingat" },
  { value: "C2", label: "Memahami" },
  { value: "C3", label: "Menerapkan" },
  { value: "C4", label: "Menganalisis" },
  { value: "C5", label: "Mengevaluasi" },
  { value: "C6", label: "Mencipta" },
] as const satisfies readonly { value: BloomLevel; label: string }[];

export const difficultyLabels = { mudah: "Mudah", sedang: "Sedang", sulit: "Sulit" } as const;
export type Difficulty = keyof typeof difficultyLabels;

export const OPTION_KEYS = ["A", "B", "C", "D", "E"] as const;

// Template imports (POST /subjects/:id/question-imports): .xlsx or .csv, at most 5 MB and 500 rows.
export const MAX_IMPORT_MB = 5;

// One question in "Ketik di EduInsight" (Figma 61:8772), before it is saved to the Bank Soal.
export type TypedQuestion = {
  // Stable React key; id is set once the backend has the question.
  key: string;
  id?: string;
  type: QuestionType;
  stem: string;
  // Pilihan ganda only, keyed A–E in order.
  options: string[];
  // Pilihan ganda: the key of the correct option ("B"). Uraian: the model answer or rubric.
  answerKey: string;
  objectiveIds: string[];
  bloomLevel: BloomLevel | "";
  difficulty: Difficulty | "";
};

export function validateTypedQuestion(question: TypedQuestion): string | undefined {
  if (!question.stem.trim()) return "Tulis soalnya terlebih dahulu.";
  if (question.stem.length > 5000) return "Soal maksimal 5000 karakter.";
  if (question.type === "pg") {
    const filled = question.options.filter((option) => option.trim());
    if (filled.length !== question.options.length) return "Isi semua opsi atau hapus opsi yang kosong.";
    if (filled.length < 2) return "Pilihan ganda butuh minimal 2 opsi.";
    if (!OPTION_KEYS.slice(0, filled.length).some((key) => key === question.answerKey)) {
      return "Tandai jawaban yang benar.";
    }
  } else if (!question.answerKey.trim()) {
    return "Isi kunci jawaban atau rubrik penilaian.";
  }
  // FR-G-050: a question without a TP blocks publishing.
  if (question.objectiveIds.length === 0) return "Pilih minimal satu TP untuk soal ini.";
  return undefined;
}

function isScore(value: string) {
  return isWhole(value, 0, 100);
}

function isWhole(value: string, min: number, max: number) {
  if (!/^\d+$/.test(value)) return false;
  const number = Number(value);
  return number >= min && number <= max;
}
