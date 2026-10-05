import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { AuthShell } from "./auth-shell";
import { RoleIcon } from "./role-heading";

const cards: { role: AuthRole; description: string; buttonClassName: string }[] = [
  {
    role: "teacher",
    description: "Kelola asesmen dan pantau perkembangan siswa secara cerdas dengan dashboard analitik AI.",
    buttonClassName: "bg-[#085ac0] hover:bg-[#00479b]",
  },
  {
    role: "student",
    description: "Lihat hasil diagnosis dan kerjakan latihan personal kamu untuk mengasah kemampuan akademik.",
    buttonClassName: "bg-black hover:bg-[#1b1b1d]",
  },
];

function RoleCard({ card }: { card: (typeof cards)[number] }) {
  const config = authRoles[card.role];

  return (
    <div className="flex flex-1 flex-col items-center rounded-xl border border-white/30 bg-white/70 p-6 text-center sm:p-[33px] shadow-[0_10px_40px_-10px_rgba(8,90,192,0.15)] backdrop-blur-[6px]">
      <div className="mb-4">
        <RoleIcon role={card.role} />
      </div>
      <h2 className="mb-2 text-xl leading-7 text-black">Untuk {config.label}</h2>
      <p className="mb-8 max-w-[20rem] text-sm leading-5 text-[#45474c]">{card.description}</p>
      <Link
        className={cn(
          "mt-auto flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-4 text-base leading-7 text-white transition-colors sm:px-6 sm:text-xl",
          card.buttonClassName,
        )}
        href={config.loginPath}
      >
        Masuk sebagai {config.label}
        <Image alt="" height={16} src="/auth/arrow-right.svg" width={16} />
      </Link>
    </div>
  );
}

export function RolePickerPage() {
  return (
    <AuthShell>
      <div className="flex max-w-[32rem] flex-col items-center gap-2 text-center">
        <h1 className="text-[32px] leading-10 tracking-[-0.32px] text-black">Selamat Datang Kembali</h1>
        <p className="text-sm leading-5 text-[#45474c]">
          Silakan pilih peran Anda untuk melanjutkan pengalaman belajar yang cerdas dan terstruktur bersama
          EduInsight.
        </p>
      </div>
      <div className="flex w-full max-w-[56rem] flex-col gap-6 sm:flex-row">
        {cards.map((card) => (
          <RoleCard card={card} key={card.role} />
        ))}
      </div>
    </AuthShell>
  );
}
