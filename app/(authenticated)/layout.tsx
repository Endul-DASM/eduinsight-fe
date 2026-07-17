import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopHeader } from "@/components/layout/top-header";

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#091426] md:flex">
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <TopHeader />
        {children}
      </main>
    </div>
  );
}
