import { ProfilePage } from "@/components/account/profile-page";
import { getCurrentUser } from "@/lib/api/users";

// /{slug}/profile — Edit Profile (Figma New Design 187:10583), opened from the top bar's account menu.
export default async function ProfileRoute() {
  return <ProfilePage user={await getCurrentUser()} />;
}
