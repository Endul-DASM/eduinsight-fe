import { ProfilePage } from "@/components/account/profile-page";
import { isMockMode } from "@/lib/api/client";
import { mockStudent } from "@/lib/api/mocks";
import { getCurrentUser } from "@/lib/api/users";

// /student/{slug}/profile, from the account menu of the student top bar.
export default async function StudentProfileRoute() {
  return <ProfilePage user={isMockMode ? mockStudent : await getCurrentUser()} />;
}
