import { notFound } from "next/navigation";
import { StudentListPage } from "@/components/students/student-list-page";
import { getSubject, getSubjectStudents } from "@/lib/api/subjects";
import { getRecommendedMaterialsByStudent } from "@/lib/remedial";

// /{slug}/students — Daftar Siswa of the subject.
export default async function StudentsRoute({ params }: PageProps<"/[subject]/students">) {
  const { subject: slug } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  // Each student's recommended materials (UAT SIS-H04), for Lihat Materi.
  const [students, recommendations] = await Promise.all([
    getSubjectStudents(subject.id),
    getRecommendedMaterialsByStudent(subject.id),
  ]);
  if (!students) notFound();

  return <StudentListPage recommendations={recommendations} students={students} subject={subject} />;
}
