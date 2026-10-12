import { Poppins } from "next/font/google";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { WorkspaceFooter } from "@/components/layout/workspace-footer";
import { cn } from "@/components/ui/cn";
import { getSubject } from "@/lib/api/subjects";
import { getCurrentUser } from "@/lib/api/users";
import { APP_ZOOM, WORKSPACE_ZOOM, zoomStyle } from "@/lib/zoom";

// The new workspace design uses Poppins; it is scoped to the subject pages.
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] });

// The two wide ellipses behind the workspace (Figma New Design 22:4162), at their design size.
function Background() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Image
        alt=""
        className="absolute left-1/2 top-[-850px] h-[1704px] w-[1067px] max-w-none -translate-x-1/2 -rotate-[107deg]"
        height={1704}
        src="/dashboard/bg-curve-top.svg"
        width={1067}
      />
      <Image
        alt=""
        className="absolute left-[calc(50%+380px)] top-[560px] h-[1704px] w-[1067px] max-w-none -translate-x-1/2 -scale-y-100 rotate-[107deg]"
        height={1704}
        src="/dashboard/bg-curve-bottom.svg"
        width={1067}
      />
    </div>
  );
}

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
      <Background />
      <AppSidebar />
      <div className="relative flex min-h-screen min-w-0 flex-1 flex-col">
        {/* The header reads ?bab= for its breadcrumb. */}
        <Suspense fallback={null}>
          <TopHeader subjectLabel={subjectLabel} user={user} />
        </Suspense>
        <main className="min-w-0 flex-1">{children}</main>
        <WorkspaceFooter />
      </div>
    </div>
  );
}
