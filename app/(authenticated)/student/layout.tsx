import type { ReactNode } from "react";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentTopHeader } from "@/components/layout/student-top-header";

export default function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
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
