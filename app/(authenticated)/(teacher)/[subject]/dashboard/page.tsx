import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { getCurrentUser } from "@/lib/api/users";

export default async function DashboardRoute() {
  const user = await getCurrentUser();

  return <DashboardPage teacherName={user.name} />;
}
