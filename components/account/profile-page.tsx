import Link from "next/link";
import { ProfileForm } from "@/components/profile/profile-form";
import type { CurrentUser } from "@/lib/api/types";

// Edit Profile (Figma New Design 187:10583) inside a subject (/{slug}/profile, /student/{slug}/profile) and on its
// own from Pilih Mapel (/profile, /student/profile), where back leads to the subject list. The name, province, photo
// and password are saved; the email is read-only.
export function ProfilePage({ user, back }: { user: CurrentUser; back?: { href: string; label: string } }) {
  return (
    <div className="relative px-4 py-10 sm:px-8">
      {back && (
        <div className="mx-auto mb-6 w-full max-w-[1048px]">
          <Link className="text-sm font-semibold text-[#0058be] hover:underline" href={back.href}>
            ← {back.label}
          </Link>
        </div>
      )}
      <ProfileForm user={user} />
    </div>
  );
}
