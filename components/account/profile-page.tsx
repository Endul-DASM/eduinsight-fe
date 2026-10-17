import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import type { CurrentUser } from "@/lib/api/types";
import { ChangePasswordForm } from "./change-password-form";

// The Profile page of teachers (/{slug}/profile) and students (/student/{slug}/profile). Editing the name, email and
// photo (Figma New Design 181:9182) needs backend endpoints that do not exist yet; the password can be changed.
export function ProfilePage({ user }: { user: CurrentUser }) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <section className={cn(sectionClassName, "mx-auto w-full max-w-[880px] flex-row flex-wrap items-center gap-6")}>
        <span className="grid size-24 shrink-0 place-items-center rounded-full bg-[#e6eff9] text-3xl font-bold text-[#004695]">
          {user.initials}
        </span>
        <div className="min-w-0 leading-normal">
          <p className="truncate text-xl font-semibold text-[#1b1b1d]">{user.name}</p>
          <p className="truncate text-sm text-[#45474c]">{user.email}</p>
          <p className="truncate text-sm text-[#45474c]">@{user.username}</p>
        </div>
      </section>
      <section className={cn(sectionClassName, "mx-auto w-full max-w-[880px]")}>
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-[#1b1b1d]">Ganti Kata Sandi</h2>
          <p className="text-sm leading-normal text-[#45474c]">
            Setelah kata sandi diganti, semua sesi di perangkat lain otomatis dikeluarkan.
          </p>
        </div>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
