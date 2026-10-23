"use client";

import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useActionState } from "react";
import { cn } from "@/components/ui/cn";
import { resendVerification } from "@/lib/actions/auth";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { outlineButtonClassName, roleButtonClassName, textLinkClassName } from "./styles";

// FR-X-008: the account exists, but signing in waits until the emailed link is opened. Shown after signing up
// ("Periksa Email Anda") and after signing in with an unverified email ("Email Belum Diverifikasi"), where sending a
// new link is the main action.
export function CheckEmail({
  role,
  title,
  children,
  identifier,
  resendIsMain = false,
}: {
  role: AuthRole;
  title: string;
  children: ReactNode;
  // Sent with the resend request; without it the email comes from the cookie set when signing in.
  identifier?: string;
  resendIsMain?: boolean;
}) {
  const [resendState, resendAction, resending] = useActionState(resendVerification, undefined);
  const loginPath = authRoles[role].loginPath;

  return (
    <div className="flex flex-col items-center gap-[35px] text-center" role="status">
      <span className="flex items-center justify-center rounded-[48px] bg-[rgba(153,188,229,0.6)] px-4 py-3">
        <Image alt="" height={40} src="/auth/badge-check.svg" width={40} />
      </span>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold leading-10 tracking-[-0.32px] text-[#1b1b1d]">{title}</h1>
        <p className="text-sm leading-normal text-[#1b1b1d]">{children}</p>
        <p className="text-xs leading-normal text-[#45474c]">Tidak ada di kotak masuk? Periksa folder Spam.</p>
      </div>
      <form action={resendAction} className="flex w-full flex-col items-center gap-3">
        {identifier && <input name="identifier" type="hidden" value={identifier} />}
        <button
          className={
            resendIsMain
              ? cn(roleButtonClassName[role], "w-full")
              : `${textLinkClassName} text-sm font-semibold disabled:opacity-60`
          }
          disabled={resending}
          type="submit"
        >
          {resending ? "Mengirim..." : resendIsMain ? "Kirim Ulang Email Verifikasi" : "Kirim ulang tautan verifikasi"}
        </button>
        {resendState && (
          <p aria-live="polite" className="text-xs leading-normal text-[#1b1b1d]">
            {resendState.message}
          </p>
        )}
      </form>
      {resendIsMain ? (
        <Link className={cn(outlineButtonClassName, "w-full")} href={loginPath}>
          Ke Halaman Masuk
        </Link>
      ) : (
        <Link className={cn(roleButtonClassName[role], "w-full")} href={loginPath}>
          Ke Halaman Masuk
          <Image alt="" height={24} src="/auth/arrow-right-24.svg" width={24} />
        </Link>
      )}
    </div>
  );
}
