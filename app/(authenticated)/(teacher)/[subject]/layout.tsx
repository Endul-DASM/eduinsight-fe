import { notFound } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PublicFooter } from "@/components/layout/public-footer";
import { TopHeader } from "@/components/layout/top-header";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentTeacher } from "@/lib/api/teacher";

export default async function TeacherLayout({ children, params }: LayoutProps<"/[subject]">) {
  const { subject: slug } = await params;
  const [teacher, subject] = await Promise.all([getCurrentTeacher(), getSubject(slug)]);

  if (!subject) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#091426]">
      <div className="flex-1 md:flex">
        <AppSidebar />
        <main className="min-w-0 flex-1">
          <TopHeader subjectName={subject.name} teacher={teacher} />
          {children}
        </main>
      </div>
      <PublicFooter />
    </div>
  );
}
