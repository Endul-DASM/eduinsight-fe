import { redirect } from "next/navigation";
import { SubjectSelectPage } from "@/components/subject-select/subject-select-page";
import { getSubjects } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";

export default async function ChooseSubjectRoute() {
  const user = await getCurrentUser();
  if (user.role === "siswa") redirect("/student/dashboard");

  const subjects = await getSubjects();

  return <SubjectSelectPage subjects={subjects} user={user} />;
}
