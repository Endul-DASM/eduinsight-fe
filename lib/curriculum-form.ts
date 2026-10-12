// Rules of the curriculum forms (SRS FR-G-020 – 023), shared by the browser and the Server Functions. The backend
// checks the same and its messages win where they differ.

import type { ChapterInput, CpInput } from "@/lib/api/curriculum";
import type { Fase } from "@/lib/api/types";

export const fases: { value: Fase; label: string; grades: string }[] = [
  { value: "D", label: "Fase D", grades: "kelas VII–IX" },
  { value: "E", label: "Fase E", grades: "kelas X" },
  { value: "F", label: "Fase F", grades: "kelas XI, XII" },
];

export type FieldErrors = Record<string, string>;

export function validateCp(input: CpInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.element.trim() || input.element.trim().length > 60) errors.element = "Elemen wajib diisi, maksimal 60 karakter.";
  if (!fases.some((fase) => fase.value === input.fase)) errors.fase = "Pilih Fase.";
  if (input.code && input.code.trim().length > 30) errors.code = "Kode maksimal 30 karakter.";
  if (!input.description.trim() || input.description.trim().length > 2000) {
    errors.description = "Deskripsi CP wajib diisi, maksimal 2000 karakter.";
  }
  return errors;
}

// A draft may be incomplete; a final Bab needs at least one CP, and a TP for each CP (FR-G-023).
export function validateChapter(input: ChapterInput, takenNumbers: number[]): FieldErrors {
  const errors: FieldErrors = {};
  if (!Number.isInteger(input.number) || input.number < 1 || input.number > 99) {
    errors.number = "Nomor Bab 1–99.";
  } else if (takenNumbers.includes(input.number)) {
    errors.number = `Bab ${input.number} sudah ada.`;
  }
  if (!input.name.trim() || input.name.trim().length > 200) errors.name = "Nama Bab wajib diisi, maksimal 200 karakter.";
  if (input.status === "final") {
    if (input.cpIds.length === 0) {
      errors.cpIds = "Pilih minimal satu CP.";
    } else if (input.cpIds.some((cpId) => !input.learningObjectives.some((objective) => objective.cpId === cpId))) {
      errors.learningObjectives = "Setiap CP yang dipilih perlu minimal satu TP.";
    }
  }
  const texts = input.learningObjectives.map((objective) => objective.description.trim().toLowerCase());
  if (new Set(texts).size !== texts.length) errors.learningObjectives = "Setiap TP hanya boleh muncul sekali.";
  return errors;
}
