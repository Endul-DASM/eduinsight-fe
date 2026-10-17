"use client";

import { useActionState } from "react";
import { verifyEmail } from "@/lib/actions/auth";
import { AuthNoticeMessage } from "./auth-notice";
import { LinkProblem } from "./link-problem";
import { primaryButtonClassName } from "./styles";

// Verifies on a button press, not on opening the page: email scanners open links ahead of the user and would
// otherwise spend the one-time token (FR-X-008).
export function VerifyEmailForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(verifyEmail.bind(null, token), undefined);

  if (state?.invalidLink) {
    return (
      <LinkProblem
        message={`${state.message} Masuk dengan akun Anda untuk meminta tautan verifikasi baru.`}
        retryHref="/login"
        retryLabel="Ke Halaman Masuk"
      />
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-[35px]">
      <p className="text-center text-sm leading-normal text-[#45474c]">
        Tekan tombol di bawah untuk mengonfirmasi alamat email Anda. Setelah itu Anda langsung masuk.
      </p>
      {state && <AuthNoticeMessage notice={{ message: state.message }} />}
      <button className={`${primaryButtonClassName} w-full`} disabled={pending} type="submit">
        {pending ? "Memverifikasi..." : "Verifikasi & Masuk"}
      </button>
    </form>
  );
}
