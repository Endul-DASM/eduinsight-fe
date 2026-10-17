import { Input } from "@/components/ui/input";
import { BellIcon, HelpIcon, SearchIcon } from "@/components/ui/icons";
import type { CurrentUser } from "@/lib/api/types";
import { ProfileMenu } from "./profile-menu";

export function StudentTopHeader({
  slug,
  subjectLabel,
  user,
}: {
  slug: string;
  subjectLabel: string;
  user: CurrentUser;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#c5c6cd] bg-[#fbf8fa] px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
      <Input
        icon={<SearchIcon className="size-[18px]" />}
        placeholder="Cari materi atau topik..."
        wrapperClassName="max-w-[448px]"
      />
      <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
        <button
          className="relative rounded-full p-2 text-[#1b1b1d] transition-colors hover:bg-[#eef2f7]"
          type="button"
        >
          <BellIcon className="size-5" />
        </button>
        <button
          className="rounded-full p-2 text-[#1b1b1d] transition-colors hover:bg-[#eef2f7]"
          type="button"
        >
          <HelpIcon className="size-5" />
        </button>
        <div className="border-l border-[#c5c6cd] pl-4">
          <ProfileMenu profileHref={`/student/${slug}/profile`} subjectLabel={subjectLabel} user={user} />
        </div>
      </div>
    </header>
  );
}
