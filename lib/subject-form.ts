// Shared by the subject modals (client) and their Server Functions.

import type { SchoolLevel } from "@/lib/api/types";

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
const GRADE_PATTERN = /^(?:(1[0-2]|[1-9])(?!\d)|(XII|XI|X|IX|VIII|VII|VI|IV|V|III|II|I)(?![A-Z]))/i;

const ROMAN_GRADES: Record<string, number> = {
  I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12,
};

// The modals only ask for the class name; the backend also needs the school level, so it is read from the grade.
export function inferSchoolLevel(className: string): SchoolLevel | null {
  const match = className.trim().match(GRADE_PATTERN);
  if (!match) return null;
  const grade = match[1] ? Number(match[1]) : ROMAN_GRADES[match[2].toUpperCase()];
  if (grade <= 6) return "SD";
  if (grade <= 9) return "SMP";
  return "SMA";
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

  const years = values.academicYear.match(/^(\d{4})\/(\d{4})$/);
  if (!years || Number(years[2]) !== Number(years[1]) + 1) {
    errors.academicYear = "Tahun ajaran berformat YYYY/YYYY, mis. 2026/2027.";
  }

  return errors;
}
