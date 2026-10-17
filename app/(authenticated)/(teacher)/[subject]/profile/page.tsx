import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { getCurrentUser } from "@/lib/api/users";

// /{slug}/profile — placeholder until Edit Profile (Figma New Design 181:9182) is built. The backend only has
// GET /me so far: no endpoints to change the name, email, password or photo.
export default async function ProfileRoute() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <section className={cn(sectionClassName, "mx-auto w-full max-w-[880px] flex-row flex-wrap items-center gap-6")}>
        <span className="grid size-24 shrink-0 place-items-center rounded-full bg-[#e6eff9] text-3xl font-bold text-[#004695]">
          {user.initials}
        </span>
        <div className="min-w-0 leading-normal">
          <p className="truncate text-xl font-semibold text-[#1b1b1d]">{user.name}</p>
          <p className="truncate text-sm text-[#45474c]">{user.email}</p>
        </div>
      </section>
      <section className={cn(sectionClassName, "mx-auto w-full max-w-[880px] items-center py-10 text-center")}>
        <p className="text-base font-semibold text-[#1b1b1d]">Halaman Edit Profile segera tersedia.</p>
        <p className="max-w-[520px] text-sm leading-normal text-[#45474c]">
          Nanti di sini Anda bisa mengganti foto, nama, email, dan password.
        </p>
      </section>
    </div>
  );
}
