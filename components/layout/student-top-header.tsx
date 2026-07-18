import { Input } from "@/components/ui/input";
import { BellIcon, HelpIcon, SearchIcon } from "@/components/ui/icons";

export function StudentTopHeader() {
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
        <div className="flex items-center gap-3 border-l border-[#c5c6cd] pl-4">
          <div className="text-right">
            <p className="text-xs font-semibold tracking-[0.04em] text-[#1b1b1d]">Alya Putri</p>
            <p className="text-[10px] text-[#45474c]">Siswa Kelas 5</p>
          </div>
          <div className="grid size-10 place-items-center rounded-full border-2 border-[#0058be] bg-[linear-gradient(180deg,#adc6ff_0%,#7ba3f0_100%)] text-sm font-bold text-white">
            AP
          </div>
        </div>
      </div>
    </header>
  );
}
