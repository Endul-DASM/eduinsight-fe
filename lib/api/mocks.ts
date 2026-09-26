import type { Subject, Teacher } from "./types";

export const mockTeacher: Teacher = {
  id: "teacher-1",
  name: "Bu Mayla",
  initials: "BM",
};

export const mockSubjects: Subject[] = [
  { id: "1", slug: "matematika", name: "Matematika" },
  { id: "2", slug: "matematika-lanjut", name: "Matematika Lanjut" },
  { id: "3", slug: "biologi", name: "Biologi" },
  { id: "4", slug: "fisika", name: "Fisika" },
  { id: "5", slug: "kimia", name: "Kimia" },
  { id: "6", slug: "sosiologi", name: "Sosiologi" },
  { id: "7", slug: "geografi", name: "Geografi" },
  { id: "8", slug: "ekonomi", name: "Ekonomi" },
  { id: "9", slug: "bahasa-indonesia", name: "B. Indonesia" },
  { id: "10", slug: "bahasa-inggris", name: "B. Inggris" },
];
