import { ProfileForm } from "@/components/profile/profile-form";
import type { CurrentUser } from "@/lib/api/types";

// The Profile page of teachers (/{slug}/profile) and students (/student/{slug}/profile): Edit Profile (Figma New Design
// 187:10583). The password can be changed; the name, email, province and photo wait for backend endpoints.
export function ProfilePage({ user }: { user: CurrentUser }) {
  return (
    <div className="px-4 py-10 sm:px-8">
      <ProfileForm user={user} />
    </div>
  );
}
