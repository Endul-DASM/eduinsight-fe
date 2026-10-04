"use client";

import { useActionState } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { login } from "@/lib/actions/auth";

const inputClassName =
  "h-12 w-full rounded-lg border border-[#c5c6cd] bg-white px-4 text-sm text-[#091426] outline-none placeholder:text-[#6b7280] focus:border-[#085ac0] focus:ring-2 focus:ring-[rgba(8,90,192,0.15)]";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-[28rem] flex-col gap-5 rounded-xl border border-white/30 bg-white/70 p-8 shadow-[0_10px_40px_-10px_rgba(8,90,192,0.15)] backdrop-blur-[6px]"
    >
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#091426]">
        Email
        <input
          autoComplete="email"
          className={inputClassName}
          defaultValue={state?.email}
          name="email"
          placeholder="nama@sekolah.id"
          required
          type="email"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm font-semibold text-[#091426]">
        Kata Sandi
        <input
          autoComplete="current-password"
          className={inputClassName}
          name="password"
          required
          type="password"
        />
      </label>
      <p aria-live="polite" className="min-h-5 text-sm text-[#ba1a1a]">
        {state?.error}
      </p>
      <button
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#085ac0] px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-[#00479b] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Memproses..." : "Masuk"}
        {!pending && <ArrowRightIcon className="size-4" />}
      </button>
    </form>
  );
}
