import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { getCurrentUser } from "@/lib/api/users";
import { firstName } from "@/lib/display-name";

export default async function DashboardRoute() {
  const user = await getCurrentUser();

  return <DashboardPage teacherName={firstName(user.name)} />;
}
