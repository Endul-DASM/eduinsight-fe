import { Poppins } from "next/font/google";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentTopHeader } from "@/components/layout/student-top-header";
import { WorkspaceBackground } from "@/components/layout/workspace-background";
import { WorkspaceFooter } from "@/components/layout/workspace-footer";
import { cn } from "@/components/ui/cn";
import { isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { SUPPORT_EMAIL } from "@/lib/help";
import { SIDEBAR_COLLAPSED, SIDEBAR_COOKIE } from "@/lib/sidebar";
import { APP_ZOOM, WORKSPACE_ZOOM, zoomStyle } from "@/lib/zoom";

// The workspace design uses Poppins; it is scoped to the subject pages.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

const footerLinks = [
  { label: "Kebijakan Privasi", href: "/privacy" },
  { label: "Ketentuan Layanan", href: "/terms" },
  { label: "Hubungi Bantuan", href: `mailto:${SUPPORT_EMAIL}` },
];

// A student's workspace for one subject: /student/{slug}/... (Figma New Design 175:32037), laid out like the
// teacher's workspace.
export default async function StudentSubjectLayout({ children, params }: LayoutProps<"/student/[subject]">) {
  const { subject: slug } = await params;
  const user = isMockMode ? mockStudent : await getCurrentUser();
  if (user.role !== "siswa") redirect("/choose-subject");

  // Null when the subject does not exist or the student has not joined it.
  const subject = await getSubject(slug);
  if (!subject) notFound();

  return (
    // Workspaces are shown at 80% (the rest of the app at 90%).
    <div
      className={cn(poppins.className, "relative min-h-screen bg-white text-[#1b1b1d] md:flex")}
      style={zoomStyle(WORKSPACE_ZOOM, APP_ZOOM)}
    >
      {/* Printing (Unduh PDF on Diagnosis) keeps only the page content. */}
      <div className="contents print:hidden">
        <WorkspaceBackground />
        <StudentSidebar initialCollapsed={(await cookies()).get(SIDEBAR_COOKIE)?.value === SIDEBAR_COLLAPSED} />
      </div>
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        {/* The header reads ?detail= for its breadcrumb. */}
        <div className="contents print:hidden">
          <Suspense fallback={null}>
            <StudentTopHeader slug={slug} subjectLabel={`${subject.name}, ${subject.class.name}`} user={user} />
          </Suspense>
        </div>
        <main className="min-w-0 flex-1">{children}</main>
        <div className="contents print:hidden">
          <WorkspaceFooter links={footerLinks} tagline="Belajar terarah, tumbuh bersama." />
        </div>
      </div>
    </div>
  );
}
