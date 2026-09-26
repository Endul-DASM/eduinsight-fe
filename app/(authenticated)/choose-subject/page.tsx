import { SubjectSelectPage } from "@/components/subject-select/subject-select-page";
import { getSubjects } from "@/lib/api/subjects";
import { getCurrentTeacher } from "@/lib/api/teacher";

export default async function ChooseSubjectRoute() {
  const [teacher, subjects] = await Promise.all([getCurrentTeacher(), getSubjects()]);

  return <SubjectSelectPage subjects={subjects} teacher={teacher} />;
}
