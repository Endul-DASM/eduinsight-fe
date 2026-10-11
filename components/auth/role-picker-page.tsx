import Image from "next/image";
import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { AuthNotice } from "@/lib/auth/messages";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { AuthNoticeMessage } from "./auth-notice";
import { AuthShell } from "./auth-shell";
import { RoleIcon } from "./role-heading";
import { roleButtonClassName } from "./styles";

const cards: { role: AuthRole; description: string; iconBackground: string }[] = [
  {
    role: "teacher",
    description: "Kelola asesmen dan pantau perkembangan siswa secara cerdas dengan dashboard analitik AI.",
    iconBackground: "bg-[#e6eff9]",
  },
  {
    role: "student",
    description: "Lihat hasil diagnosis dan kerjakan latihan personal kamu untuk mengasah kemampuan akademik.",
    iconBackground: "bg-[#d9d9d9]",
  },
];

function RoleCard({ card }: { card: (typeof cards)[number] }) {
  const config = authRoles[card.role];

  return (
    <div className="flex w-full max-w-[484px] flex-col items-center gap-[18px] rounded-3xl bg-[rgba(245,243,244,0.6)] p-6 text-center shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs">
      <div className="flex flex-col items-center gap-[15px]">
        <RoleIcon iconBackground={card.iconBackground} role={card.role} />
        <h2 className="text-2xl font-semibold leading-normal text-[#1b1b1d] sm:text-[32px]">Untuk {config.label}</h2>
        <p className="text-base leading-normal text-[#75777d] sm:text-xl">{card.description}</p>
      </div>
      <Link className={cn(roleButtonClassName[card.role], "mt-auto")} href={config.loginPath}>
        Masuk Sebagai {config.label}
        <Image alt="" height={24} src="/auth/arrow-right-24.svg" width={24} />
      </Link>
    </div>
  );
}

// Figma New Design 19:1689. notice explains why the user is here, e.g. after the session ended.
export function RolePickerPage({ notice }: { notice?: AuthNotice }) {
  return (
    <AuthShell variant="picker">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-[32px] font-bold leading-normal text-black sm:text-5xl">Halo, Selamat Datang Kembali!</h1>
        <p className="max-w-[575px] text-base leading-normal text-[#45474c]">
          Silakan pilih peran Anda untuk melanjutkan pengalaman belajar yang cerdas dan terstruktur bersama
          EduInsight.
        </p>
      </div>
      {notice && (
        <div className="w-full max-w-[1011px]">
          <AuthNoticeMessage notice={notice} />
        </div>
      )}
      <div className="flex w-full flex-col items-center gap-6 md:flex-row md:items-stretch md:justify-center md:gap-[43px]">
        {cards.map((card) => (
          <RoleCard card={card} key={card.role} />
        ))}
      </div>
    </AuthShell>
  );
}
