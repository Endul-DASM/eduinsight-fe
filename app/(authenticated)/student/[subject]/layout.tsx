import { notFound, redirect } from "next/navigation";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentTopHeader } from "@/components/layout/student-top-header";
import { isMockMode } from "@/lib/api/client";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";

// A student's workspace for one subject: /student/{slug}/...
export default async function StudentSubjectLayout({ children, params }: LayoutProps<"/student/[subject]">) {
  const { subject: slug } = await params;
  if (!isMockMode && (await getCurrentUser()).role !== "siswa") redirect("/choose-subject");

  // Null when the subject does not exist or the student has not joined it.
  const subject = await getSubject(slug);
  if (!subject) notFound();

  return (
    <div className="min-h-screen bg-white text-[#091426] md:flex">
      <StudentSidebar />
      <main className="min-w-0 flex-1">
        <StudentTopHeader />
        {children}
      </main>
    </div>
  );
}
