// Shared by the subject modals (client) and their Server Functions.

import type { Fase, SchoolLevel } from "@/lib/api/types";

export type SubjectFormValues = {
  name: string;
  className: string;
  academicYear: string;
};

export type SubjectFormField = keyof SubjectFormValues;

export type SubjectFormErrors = Partial<Record<SubjectFormField, string>>;

export const CLASS_LEVEL_MESSAGE = "Awali nama kelas dengan tingkat, mis. 4A, VII B, atau X-1 MIPA.";

// Grade at the start of the class name: a number that may be followed by a letter ("4A", "10 IPA"), or a Roman
// numeral that may not ("VII B", "X-1 MIPA", but not "IPA"). Longer numerals come first so "XII" is not read as "X".
// Grade XIII is the fourth year of a 4-year SMK/MAK program.
const GRADE_PATTERN = /^(?:(1[0-3]|[1-9])(?!\d)|(XIII|XII|XI|X|IX|VIII|VII|VI|IV|V|III|II|I)(?![A-Z]))/i;

const ROMAN_GRADES: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13,
};

function gradeOf(className: string): number | null {
  const match = className.trim().match(GRADE_PATTERN);
  if (!match) return null;
  return match[1] ? Number(match[1]) : ROMAN_GRADES[match[2].toUpperCase()];
}

// The modals only ask for the class name; the backend also needs the school level, so it is read from the grade.
// SMK/MAK classes (up to XIII) count as SMA.
export function inferSchoolLevel(className: string): SchoolLevel | null {
  const grade = gradeOf(className);
  if (grade === null) return null;
  if (grade <= 6) return "SD";
  if (grade <= 9) return "SMP";
  return "SMA";
}

// Fase of a grade (Kurikulum Merdeka): A = I–II, B = III–IV, C = V–VI (SD/MI), D = VII–IX (SMP/MTs), E = X,
// F = XI–XII, and XIII for 4-year SMK/MAK. Same as the backend's suggest_fase, which does not know XIII yet.
const FASE_OF_GRADE: Fase[] = ["A", "A", "B", "B", "C", "C", "D", "D", "D", "E", "F", "F", "F"];

export function faseOfClass(className: string): Fase | null {
  const grade = gradeOf(className);
  return grade === null ? null : FASE_OF_GRADE[grade - 1];
}

export function validateSubjectForm(values: SubjectFormValues): SubjectFormErrors {
  const errors: SubjectFormErrors = {};

  if (values.name.length < 2 || values.name.length > 100) {
    errors.name = "Nama mata pelajaran 2–100 karakter.";
  }

  if (!values.className || values.className.length > 60) {
    errors.className = "Nama kelas 1–60 karakter.";
  } else if (!inferSchoolLevel(values.className)) {
    errors.className = CLASS_LEVEL_MESSAGE;
  }

  // One message per case (UAT MAPEL-U01): empty, not 8 digits, or the second year not right after the first.
  const years = values.academicYear.match(/^(\d{4})\/(\d{4})$/);
  if (!values.academicYear) {
    errors.academicYear = "Tahun ajaran wajib diisi, mis. 2026/2027.";
  } else if (!years) {
    errors.academicYear = "Tahun ajaran terdiri dari 8 angka, mis. 2026/2027.";
  } else if (Number(years[2]) !== Number(years[1]) + 1) {
    errors.academicYear = "Tahun kedua harus satu tahun setelah tahun pertama, mis. 2026/2027.";
  }

  return errors;
}
