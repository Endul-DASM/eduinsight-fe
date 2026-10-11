"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { cn } from "@/components/ui/cn";
import { register } from "@/lib/actions/auth";
import type { AuthNotice } from "@/lib/auth/messages";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { AuthDivider } from "./auth-card";
import { AuthNoticeMessage } from "./auth-notice";
import { GoogleButton } from "./google-button";
import { RegisterForm } from "./register-form";
import { RoleHeading } from "./role-heading";
import { outlineButtonClassName, roleButtonClassName } from "./styles";

// Figma New Design 22:3160 (Guru) and 22:3435 (Siswa).
function RegisterSuccess({ role }: { role: AuthRole }) {
  const config = authRoles[role];

  return (
    <div className="flex flex-col items-center gap-[35px] text-center" role="status">
      <span className="flex items-center justify-center rounded-[48px] bg-[rgba(153,188,229,0.6)] px-4 py-3">
        <Image alt="" height={40} src="/auth/badge-check.svg" width={40} />
      </span>
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold leading-10 tracking-[-0.32px] text-[#1b1b1d]">Akun Berhasil Dibuat!</h1>
        <p className="text-xs leading-normal text-[#1b1b1d]">
          Silakan Login kembali untuk masuk sebagai {config.label.toLowerCase()}.
        </p>
      </div>
      <Link className={cn(roleButtonClassName[role], "w-full")} href={config.loginPath}>
        Masuk Sebagai {config.label}
        <Image alt="" height={24} src="/auth/arrow-right-24.svg" width={24} />
      </Link>
    </div>
  );
}

// The whole sign-up card (Figma New Design 22:2930 → 22:3020): "Buat Akun" opens the form in place, and Google moves
// under it. notice comes from ?error=, e.g. after a failed Google sign-up.
export function RegisterPanel({ role, notice }: { role: AuthRole; notice?: AuthNotice }) {
  const [open, setOpen] = useState(false);
  // The role comes from the page's URL (/register/[role]).
  const [state, formAction, pending] = useActionState(register.bind(null, role), undefined);

  if (state?.created) return <RegisterSuccess role={role} />;

  return (
    <>
      <RoleHeading role={role} title={`Daftar Sebagai ${authRoles[role].label}`} />
      {notice && <AuthNoticeMessage notice={notice} />}
      {open ? (
        <>
          <RegisterForm formAction={formAction} pending={pending} role={role} state={state} />
          <div className="flex flex-col gap-4">
            <AuthDivider />
            <GoogleButton intent="register" role={role} />
          </div>
        </>
      ) : (
        <>
          <button className={cn(outlineButtonClassName, "w-full")} onClick={() => setOpen(true)} type="button">
            Buat Akun
          </button>
          <GoogleButton intent="register" role={role} />
        </>
      )}
    </>
  );
}
