import { ProfilePage } from "@/components/account/profile-page";
import { getCurrentUser } from "@/lib/api/users";

// /{slug}/profile, from the account menu of the top bar.
export default async function ProfileRoute() {
  return <ProfilePage user={await getCurrentUser()} />;
}
