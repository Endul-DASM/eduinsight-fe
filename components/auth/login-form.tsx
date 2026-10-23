"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import type { AuthNotice } from "@/lib/auth/messages";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { AuthFootnote } from "./auth-card";
import { AuthNoticeMessage } from "./auth-notice";
import { PasswordField } from "./password-field";
import { primaryButtonClassName, textLinkClassName } from "./styles";
import { TextField } from "./text-field";

// initialNotice comes from ?error= after a failed Google sign-in.
export function LoginForm({ role, initialNotice }: { role: AuthRole; initialNotice?: AuthNotice }) {
  // The role comes from the page's URL (/login/[role]).
  const [state, formAction, pending] = useActionState(login.bind(null, role), undefined);
  const notice = state ?? initialNotice;

  return (
    <form action={formAction} className="flex flex-col gap-[35px]">
      <div className="flex flex-col gap-[13px]">
        <TextField
          autoComplete="username"
          defaultValue={state?.identifier}
          label="Email/Username"
          name="identifier"
          placeholder="Masukkan Email atau Username Anda"
          required
        />
        <PasswordField
          autoComplete="current-password"
          label="Password"
          name="password"
          placeholder="Masukkan password Anda"
          required
        />
      </div>
      {notice && <AuthNoticeMessage notice={notice} />}
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <AuthFootnote>
          Belum punya akun?{" "}
          <Link className={textLinkClassName} href={authRoles[role].registerPath}>
            Daftar sekarang
          </Link>
        </AuthFootnote>
        <Link className={`${textLinkClassName} text-xs`} href="/forgot-password">
          Lupa kata sandi?
        </Link>
      </div>
      <div className="flex justify-end">
        <button className={`${primaryButtonClassName} w-full sm:w-auto`} disabled={pending} type="submit">
          {pending ? "Memproses..." : "Login"}
        </button>
      </div>
    </form>
  );
}
