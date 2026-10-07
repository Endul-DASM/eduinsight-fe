import type { CurrentUser, SchoolClass, Subject, TeacherSummary } from "./types";

export const mockTeacher: CurrentUser = {
  id: "teacher-1",
  name: "Bu Mayla",
  username: "mayla",
  email: "mayla@eduinsight.id",
  role: "guru",
  initials: "BM",
};

// Mock mode has no sessions, so the student pages show this user instead of mockTeacher.
export const mockStudent: CurrentUser = {
  id: "student-1",
  name: "Alya",
  username: "alya",
  email: "alya@eduinsight.id",
  role: "siswa",
  initials: "A",
};

const mockTeacherSummary: TeacherSummary = {
  id: mockTeacher.id,
  name: mockTeacher.name,
  email: mockTeacher.email,
};

export const mockTeachers: TeacherSummary[] = [
  mockTeacherSummary,
  { id: "teacher-2", name: "Pak Budi", email: "budi@eduinsight.id" },
];

export const mockClasses: SchoolClass[] = [
  { id: "class-1", name: "X IPA 1", level: "SMA", academicYear: "2026/2027" },
  { id: "class-2", name: "X IPA 2", level: "SMA", academicYear: "2026/2027" },
];

function mockSubject(id: string, slug: string, name: string): Subject {
  return { id, slug, name, kkmDefault: 75, class: mockClasses[0], teachers: [mockTeacherSummary] };
}

export const mockSubjects: Subject[] = [
  mockSubject("1", "matematika", "Matematika"),
  mockSubject("2", "matematika-lanjut", "Matematika Lanjut"),
  mockSubject("3", "biologi", "Biologi"),
  mockSubject("4", "fisika", "Fisika"),
  mockSubject("5", "kimia", "Kimia"),
  mockSubject("6", "sosiologi", "Sosiologi"),
  mockSubject("7", "geografi", "Geografi"),
  mockSubject("8", "ekonomi", "Ekonomi"),
  mockSubject("9", "bahasa-indonesia", "B. Indonesia"),
  mockSubject("10", "bahasa-inggris", "B. Inggris"),
];
