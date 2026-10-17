"use client";

import { useActionState } from "react";
import { AuthNoticeMessage, AuthSuccessMessage } from "@/components/auth/auth-notice";
import { PasswordField } from "@/components/auth/password-field";
import { primaryButtonClassName } from "@/components/auth/styles";
import { changePassword } from "@/lib/actions/auth";

// Ganti kata sandi on the Profile page, for teachers and students. React clears the fields after each submit.
export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined);

  return (
    <form action={formAction} className="flex w-full max-w-[443px] flex-col gap-5" noValidate>
      <PasswordField
        autoComplete="current-password"
        error={state?.fields?.currentPassword}
        label="Kata Sandi Saat Ini"
        name="currentPassword"
        placeholder="Masukkan kata sandi saat ini"
      />
      <PasswordField
        autoComplete="new-password"
        error={state?.fields?.password}
        label="Kata Sandi Baru"
        name="password"
        placeholder="Minimal 8 karakter"
      />
      <PasswordField
        autoComplete="new-password"
        error={state?.fields?.passwordConfirmation}
        label="Konfirmasi Kata Sandi Baru"
        name="passwordConfirmation"
        placeholder="Masukkan ulang kata sandi baru"
      />
      {state?.message &&
        (state.changed ? (
          <AuthSuccessMessage>{state.message}</AuthSuccessMessage>
        ) : (
          <AuthNoticeMessage notice={{ message: state.message }} />
        ))}
      <div className="flex justify-end">
        <button className={primaryButtonClassName} disabled={pending} type="submit">
          {pending ? "Menyimpan..." : "Simpan Kata Sandi"}
        </button>
      </div>
    </form>
  );
}
