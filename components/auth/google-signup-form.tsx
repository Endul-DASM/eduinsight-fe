"use client";

import { type FormEvent, useActionState, useState } from "react";
import { completeGoogleSignup } from "@/lib/actions/auth";
import type { AuthRole } from "@/lib/auth/roles";
import { validateUsername } from "@/lib/auth/validation";
import { AuthCard } from "./auth-card";
import { AuthNoticeMessage } from "./auth-notice";
import { primaryButtonClassName } from "./styles";
import { TextField } from "./text-field";

// SRS 6.1.1: Google gives no username, so the user picks one. The email comes from Google and cannot change.
export function GoogleSignupForm({
  role,
  email,
  suggestedUsername,
}: {
  role: AuthRole;
  email: string;
  suggestedUsername: string;
}) {
  const [state, formAction, pending] = useActionState(completeGoogleSignup, undefined);
  const [clientError, setClientError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const username = String(new FormData(event.currentTarget).get("username") ?? "").trim();
    const error = validateUsername(username);
    setClientError(error);
    if (error) event.preventDefault();
  }

  return (
    <AuthCard>
      <form action={formAction} className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
        <input name="role" type="hidden" value={role} />
        <div className="flex flex-col gap-3">
          <TextField label="Email" name="email" readOnly tabIndex={-1} value={email} />
          <TextField
            autoCapitalize="none"
            autoComplete="username"
            defaultValue={state?.username ?? suggestedUsername}
            error={clientError ?? state?.fields?.username}
            label="Username"
            maxLength={30}
            name="username"
            placeholder="contoh: andi.pratama"
          />
        </div>
        {state?.message && <AuthNoticeMessage notice={{ message: state.message, wrongRole: state.wrongRole }} />}
        <div className="flex justify-end">
          <button className={primaryButtonClassName} disabled={pending} type="submit">
            {pending ? "Memproses..." : "Daftarkan Akun"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
