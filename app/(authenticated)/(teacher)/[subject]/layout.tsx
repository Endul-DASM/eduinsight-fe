import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { WorkspaceBackground } from "@/components/layout/workspace-background";
import { WorkspaceFooter } from "@/components/layout/workspace-footer";
import { cn } from "@/components/ui/cn";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { SIDEBAR_COLLAPSED, SIDEBAR_COOKIE } from "@/lib/sidebar";
import { APP_ZOOM, WORKSPACE_ZOOM, zoomStyle } from "@/lib/zoom";

// The new workspace design uses Poppins; it is scoped to the subject pages.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

export default async function TeacherLayout({ children, params }: LayoutProps<"/[subject]">) {
  const { subject: slug } = await params;
  const user = await getCurrentUser();
  if (user.role === "siswa") redirect("/student/dashboard");

  const subject = await getSubject(slug);

  if (!subject) {
    notFound();
  }

  const subjectLabel = `${subject.name} · ${subject.class.name}`;

  return (
    // Workspaces are shown at 80% (the rest of the app at 90%).
    <div
      className={cn(poppins.className, "relative min-h-screen bg-white text-[#1b1b1d] md:flex")}
      style={zoomStyle(WORKSPACE_ZOOM, APP_ZOOM)}
    >
      <WorkspaceBackground />
      {/* Printing a page (e.g. Unduh Soal) leaves out the workspace around it. */}
      <div className="contents print:hidden">
        <AppSidebar initialCollapsed={(await cookies()).get(SIDEBAR_COOKIE)?.value === SIDEBAR_COLLAPSED} />
      </div>
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        {/* The header reads ?bab= for its breadcrumb. */}
        <div className="contents print:hidden">
          <Suspense fallback={null}>
            <TopHeader subjectLabel={subjectLabel} user={user} />
          </Suspense>
        </div>
        <main className="min-w-0 flex-1">{children}</main>
        <div className="contents print:hidden">
          <WorkspaceFooter />
        </div>
      </div>
    </div>
  );
}
