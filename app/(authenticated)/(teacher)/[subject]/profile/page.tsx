import { ProfileForm } from "@/components/profile/profile-form";
import { getCurrentUser } from "@/lib/api/users";

// /{slug}/profile — Edit Profile (Figma New Design 187:10583), opened from the top bar's account menu. The backend
// only has GET /me so far: no endpoints to change the name, email, province, password or photo.
export default async function ProfileRoute() {
  const user = await getCurrentUser();

  return (
    <div className="px-4 py-10 sm:px-8">
      <ProfileForm user={user} />
    </div>
  );
}
