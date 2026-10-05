"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, resendVerification } from "@/lib/actions/auth";
import type { AuthNotice } from "@/lib/auth/messages";
import type { AuthRole } from "@/lib/auth/roles";
import { AuthCard } from "./auth-card";
import { AuthNoticeMessage } from "./auth-notice";
import { PasswordField } from "./password-field";
import { primaryButtonClassName, textLinkClassName } from "./styles";
import { TextField } from "./text-field";

// initialNotice comes from ?error= after a failed Google sign-in.
export function LoginForm({ role, initialNotice }: { role: AuthRole; initialNotice?: AuthNotice }) {
  const [state, formAction, pending] = useActionState(login, undefined);
  const [resendState, resendAction, resending] = useActionState(resendVerification, undefined);
  const notice = state ?? initialNotice;

  return (
    <AuthCard>
      <form action={formAction} className="flex flex-col gap-6">
        <input name="role" type="hidden" value={role} />
        <div className="flex flex-col gap-3">
          <TextField
            autoComplete="username"
            defaultValue={state?.identifier}
            label="Username/Email"
            name="identifier"
            placeholder="Masukkan username atau email"
            required
          />
          <PasswordField
            autoComplete="current-password"
            label="Password"
            name="password"
            placeholder="Masukkan kata sandi"
            required
          />
        </div>
        {notice && (
          <AuthNoticeMessage notice={notice}>
            {state?.unverified && (
              <div className="mt-2 flex flex-col items-start gap-1">
                {/* Same form, so the resend request carries the identifier typed above. */}
                <button
                  className={`${textLinkClassName} font-semibold disabled:opacity-60`}
                  disabled={resending}
                  formAction={resendAction}
                  type="submit"
                >
                  {resending ? "Mengirim..." : "Kirim ulang tautan verifikasi"}
                </button>
                {resendState && <p aria-live="polite">{resendState.message}</p>}
              </div>
            )}
          </AuthNoticeMessage>
        )}
        <div className="flex items-center justify-between gap-4">
          <Link className={`${textLinkClassName} text-sm`} href="/forgot-password">
            Lupa kata sandi?
          </Link>
          <button className={primaryButtonClassName} disabled={pending} type="submit">
            {pending ? "Memproses..." : "Login"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
