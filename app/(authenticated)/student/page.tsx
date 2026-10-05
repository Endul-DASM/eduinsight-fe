import { redirect } from "next/navigation";
import { StudentSubjectSelectPage } from "@/components/student/student-subject-select-page";
import { ApiError, isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getSubjects } from "@/lib/api/subjects";
import type { Subject } from "@/lib/api/types";
import { getCurrentUser } from "@/lib/api/users";

// /student — the student's subject list. ?join={code} opens the join modal with the code filled in.
export default async function StudentHomeRoute({ searchParams }: PageProps<"/student">) {
  // Mock mode has no sessions and its current user is a teacher, so it shows a mock student instead.
  const user = isMockMode ? mockStudent : await getCurrentUser();
  if (user.role !== "siswa") redirect("/choose-subject");

  let subjects: Subject[] = [];
  let listUnavailable = false;
  try {
    subjects = await getSubjects();
  } catch (error) {
    // The backend only serves the subject list to teachers so far.
    if (!(error instanceof ApiError) || error.status !== 403) throw error;
    listUnavailable = true;
  }

  const { join } = await searchParams;
  return (
    <StudentSubjectSelectPage
      initialJoinCode={typeof join === "string" ? join : undefined}
      listUnavailable={listUnavailable}
      subjects={subjects}
      user={user}
    />
  );
}
