"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/actions/auth";
import { AuthFootnote } from "./auth-card";
import { AuthNoticeMessage, AuthSuccessMessage } from "./auth-notice";
import { primaryButtonClassName, textLinkClassName } from "./styles";
import { TextField } from "./text-field";

// SRS FR-X-004. The answer is the same whether or not the email is registered.
export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-[35px]" noValidate>
      <p className="text-center text-sm leading-normal text-[#45474c]">
        Masukkan email akun Anda. Kami akan mengirim tautan untuk membuat kata sandi baru.
      </p>
      <TextField
        autoComplete="email"
        defaultValue={state?.email}
        error={state?.error}
        label="Email"
        maxLength={255}
        name="email"
        placeholder="Masukkan Email Anda"
        required
        type="email"
      />
      {state?.message &&
        (state.sent ? (
          <AuthSuccessMessage>
            {state.message} Tautan berlaku 1 jam. Tidak ada di kotak masuk? Periksa folder Spam.
          </AuthSuccessMessage>
        ) : (
          <AuthNoticeMessage notice={{ message: state.message }} />
        ))}
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <AuthFootnote>
          Ingat kata sandi?{" "}
          <Link className={textLinkClassName} href="/login">
            Masuk
          </Link>
        </AuthFootnote>
        <button className={`${primaryButtonClassName} w-full sm:w-auto`} disabled={pending} type="submit">
          {pending ? "Mengirim..." : state?.sent ? "Kirim Ulang" : "Kirim Tautan"}
        </button>
      </div>
    </form>
  );
}
