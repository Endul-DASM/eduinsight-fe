"use client";

import { useActionState } from "react";
import { resetPassword } from "@/lib/actions/auth";
import { AuthNoticeMessage } from "./auth-notice";
import { LinkProblem } from "./link-problem";
import { PasswordField } from "./password-field";
import { primaryButtonClassName } from "./styles";

// SRS FR-X-004: the token comes from the emailed link. On success the user is signed in.
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPassword.bind(null, token), undefined);

  if (state?.invalidLink) {
    return (
      <LinkProblem
        message={`${state.message} Minta tautan baru untuk mengatur ulang kata sandi.`}
        retryHref="/forgot-password"
        retryLabel="Minta Tautan Baru"
      />
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-[35px]" noValidate>
      <div className="flex flex-col gap-[13px]">
        <PasswordField
          autoComplete="new-password"
          autoFocus
          error={state?.fields?.password}
          label="Kata Sandi Baru"
          name="password"
          placeholder="8–20 karakter, gabungan huruf dan angka"
        />
        <PasswordField
          autoComplete="new-password"
          error={state?.fields?.passwordConfirmation}
          label="Konfirmasi Kata Sandi Baru"
          name="passwordConfirmation"
          placeholder="Masukkan ulang kata sandi baru"
        />
      </div>
      {state?.message && <AuthNoticeMessage notice={{ message: state.message }} />}
      <button className={`${primaryButtonClassName} w-full`} disabled={pending} type="submit">
        {pending ? "Menyimpan..." : "Simpan & Masuk"}
      </button>
    </form>
  );
}
