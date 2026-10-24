"use client";

import { useActionState } from "react";
import { AuthNoticeMessage, AuthSuccessMessage } from "@/components/auth/auth-notice";
import { PasswordField } from "@/components/auth/password-field";
import { primaryButtonClassName } from "@/components/auth/styles";
import { setPassword } from "@/lib/actions/auth";

// Buat Password on the Profile page, for an account that signs in with Google and has no password yet.
export function SetPasswordForm() {
  const [state, formAction, pending] = useActionState(setPassword, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-[443px] flex-col gap-5" noValidate>
      <p className="text-sm leading-normal text-[#45474c]">
        Akun ini masuk dengan Google. Dengan kata sandi, Anda juga bisa masuk memakai username atau email.
      </p>
      <PasswordField
        autoComplete="new-password"
        error={state?.fields?.password}
        label="Kata Sandi"
        name="password"
        placeholder="8–20 karakter, gabungan huruf dan angka"
      />
      <PasswordField
        autoComplete="new-password"
        error={state?.fields?.passwordConfirmation}
        label="Konfirmasi Kata Sandi"
        name="passwordConfirmation"
        placeholder="Masukkan ulang kata sandi"
      />
      {state?.message &&
        (state.created ? (
          <AuthSuccessMessage>{state.message}</AuthSuccessMessage>
        ) : (
          <AuthNoticeMessage notice={{ message: state.message }} />
        ))}
      <div className="flex justify-end">
        <button className={primaryButtonClassName} disabled={pending} type="submit">
          {pending ? "Menyimpan..." : "Buat Kata Sandi"}
        </button>
      </div>
    </form>
  );
}
