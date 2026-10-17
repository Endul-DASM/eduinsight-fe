import { redirect } from "next/navigation";
import { StudentSubjectSelectPage } from "@/components/student/student-subject-select-page";
import { isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getSubjects } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";

// /student — the student's subject list. ?join={code} opens the join modal with the code filled in.
export default async function StudentHomeRoute({ searchParams }: PageProps<"/student">) {
  // Mock mode has no sessions and its current user is a teacher, so it shows a mock student instead.
  const user = isMockMode ? mockStudent : await getCurrentUser();
  if (user.role !== "siswa") redirect("/choose-subject");

  // GET /subjects returns the subjects the student has joined.
  const subjects = await getSubjects();

  const { join } = await searchParams;
  return (
    <StudentSubjectSelectPage
      initialJoinCode={typeof join === "string" ? join : undefined}
      subjects={subjects}
      user={user}
    />
  );
}
