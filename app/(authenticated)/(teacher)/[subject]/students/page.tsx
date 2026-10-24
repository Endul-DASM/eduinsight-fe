import { notFound } from "next/navigation";
import { StudentListPage } from "@/components/students/student-list-page";
import { getSubject, getSubjectStudents } from "@/lib/api/subjects";

// /{slug}/students — Daftar Siswa of the subject.
export default async function StudentsRoute({ params }: PageProps<"/[subject]/students">) {
  const { subject: slug } = await params;
  const subject = await getSubject(slug);
  if (!subject) notFound();

  const students = await getSubjectStudents(subject.id);
  if (!students) notFound();

  return <StudentListPage students={students} subject={subject} />;
}
