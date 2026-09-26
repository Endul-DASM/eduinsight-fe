import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { getCurrentTeacher } from "@/lib/api/teacher";

export default async function DashboardRoute() {
  const teacher = await getCurrentTeacher();

  return <DashboardPage teacherName={teacher.name} />;
}
