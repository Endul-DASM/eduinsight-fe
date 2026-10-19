// Sample Dashboard Guru data for mock mode (API_BASE_URL unset), shaped like Figma New Design 22:4162.

import type { ChapterDiagnosis, DashboardData, DiagnosisLabel, LabelGroups, StudentScore } from "./compute";

const names = [
  "Andi Pratama", "Bunga Lestari", "Citra Ayu", "Dimas Saputra", "Eka Putri", "Fajar Nugroho", "Gita Rahma",
  "Hadi Wijaya", "Intan Sari", "Joko Susilo", "Kirana Dewi", "Lutfi Hakim", "Maya Anggraini", "Nanda Putra",
  "Oki Firmansyah", "Putri Ramadhani", "Qori Aulia", "Rizky Maulana", "Salsa Nabila", "Taufik Hidayat",
  "Umi Kalsum", "Vina Melati", "Wahyu Setiawan", "Xena Aprilia", "Yoga Pratama", "Zahra Amelia", "Arif Budiman",
  "Bella Safitri", "Candra Kusuma", "Dewi Sartika", "Elang Mahendra", "Farah Nadia",
];

const students = names.map((name, index) => ({ studentId: `mock-student-${index + 1}`, name }));

// Spread the class over the labels, e.g. [18, 10, 4, 2], with a score inside each label's range (BR-04).
function groups(counts: [number, number, number, number], offset = 0): LabelGroups {
  const ranges: Record<DiagnosisLabel, [number, number]> = { SB: [90, 100], B: [75, 89], C: [60, 74], K: [35, 59] };
  const result: LabelGroups = { SB: [], B: [], C: [], K: [] };
  let index = offset;
  (["SB", "B", "C", "K"] as DiagnosisLabel[]).forEach((label, position) => {
    const [low, high] = ranges[label];
    for (let n = 0; n < counts[position]; n += 1) {
      const student = students[index % students.length];
      const score: StudentScore = { ...student, score: high - ((n * 3) % (high - low + 1)) };
      result[label].push(score);
      index += 1;
    }
  });
  return result;
}

const chapterNames = [
  "Eksponen dan Logaritma",
  "Barisan dan Deret",
  "Vektor",
  "Trigonometri",
  "Sistem Persamaan Linear",
  "Statistika",
];

const chapterCounts: [number, number, number, number][] = [
  [18, 10, 4, 0],
  [14, 12, 4, 2],
  [6, 9, 11, 6],
  [16, 12, 3, 1],
  [12, 14, 4, 2],
  [15, 13, 3, 1],
];

const chapters: ChapterDiagnosis[] = chapterNames.map((name, index) => ({
  id: `mock-chapter-${index + 1}`,
  number: index + 1,
  name,
  students: groups(chapterCounts[index], index * 5),
  objectives:
    index === 0
      ? [
          { number: "1.1", description: "Menggeneralisasi sifat-sifat operasi bilangan berpangkat (eksponen).", counts: [12, 14, 6, 0] },
          { number: "1.2", description: "Menyelesaikan masalah kontekstual menggunakan fungsi eksponen.", counts: [6, 12, 10, 4] },
          { number: "1.3", description: "Menjelaskan konsep logaritma serta hubungannya dengan eksponen.", counts: [4, 8, 10, 10] },
          { number: "1.4", description: "Menggunakan sifat-sifat logaritma untuk menyederhanakan bentuk aljabar.", counts: [8, 14, 8, 2] },
        ].map((objective, position) => ({
          id: `mock-objective-1-${position + 1}`,
          number: objective.number,
          description: objective.description,
          itemCount: position === 2 ? 2 : 4,
          students: groups(objective.counts as [number, number, number, number], position * 3),
        }))
      : [],
}));

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const mockDashboard: DashboardData = {
  studentCount: 32,
  assessedCount: 32,
  average: { value: 72, trend: "up" },
  remedial: { count: 6 },
  topMisconception: { tag: "Konsep Pecahan", studentCount: 21, percent: 65 },
  chapters,
  activities: [
    {
      id: "mock-grading",
      kind: "grading",
      title: "Jawaban uraian menunggu dinilai",
      detail: "6 jawaban di Post-test Eksponen.",
      at: hoursAgo(1),
    },
    {
      id: "mock-closed",
      kind: "closed",
      title: "Post-test Statistika selesai",
      detail: "32 siswa berhasil menyelesaikan asesmen.",
      at: hoursAgo(2),
    },
    {
      id: "mock-published",
      kind: "published",
      title: "Ulangan Harian Vektor dipublikasikan",
      detail: "20 soal siap dikerjakan siswa.",
      at: hoursAgo(30),
    },
    {
      id: "mock-joined",
      kind: "joined",
      title: "Farah Nadia bergabung ke kelas",
      detail: "Bergabung dengan kode kelas.",
      at: hoursAgo(24 * 10),
    },
  ],
};
