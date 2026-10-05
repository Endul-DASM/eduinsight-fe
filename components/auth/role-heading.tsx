import Image from "next/image";
import { cn } from "@/components/ui/cn";
import { type AuthRole, authRoles } from "@/lib/auth/roles";

export function RoleIcon({ role }: { role: AuthRole }) {
  const { icon, iconBackground } = authRoles[role];

  return (
    <div className={cn("grid size-20 shrink-0 place-items-center rounded-full", iconBackground)}>
      <Image alt="" className={icon.className} height={icon.height} src={icon.src} width={icon.width} />
    </div>
  );
}

export function RoleHeading({ role, title }: { role: AuthRole; title: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <RoleIcon role={role} />
      <h1 className="text-center text-2xl font-bold leading-10 tracking-[-0.32px] text-black">{title}</h1>
    </div>
  );
}
