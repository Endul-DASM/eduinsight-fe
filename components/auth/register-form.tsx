"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import type { RegisterState } from "@/lib/actions/auth";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { type FieldErrors, type RegisterValues, validateRegister } from "@/lib/auth/validation";
import { AuthFootnote } from "./auth-card";
import { AuthNoticeMessage } from "./auth-notice";
import { PasswordField } from "./password-field";
import { primaryButtonClassName, textLinkClassName } from "./styles";
import { TextField } from "./text-field";

function valuesOf(form: HTMLFormElement): RegisterValues {
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) ?? "");
  return {
    username: value("username").trim(),
    name: value("name").trim().replace(/\s+/g, " "),
    email: value("email").trim(),
    password: value("password"),
    passwordConfirmation: value("passwordConfirmation"),
  };
}

// Figma New Design 22:3020. The action state lives in RegisterPanel, which swaps the card for the success screen.
export function RegisterForm({
  role,
  state,
  formAction,
  pending,
}: {
  role: AuthRole;
  state: RegisterState;
  formAction: (formData: FormData) => void;
  pending: boolean;
}) {
  // Checked in the browser before submitting; the Server Function repeats the same rules.
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const serverErrors = state?.fields ?? {};
  const errorOf = (field: keyof FieldErrors) => clientErrors[field] ?? serverErrors[field];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateRegister(valuesOf(event.currentTarget));
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) event.preventDefault();
  }

  return (
    <form action={formAction} className="flex flex-col gap-[35px]" noValidate onSubmit={handleSubmit}>
      <div className="flex flex-col gap-[13px]">
        <TextField
          autoCapitalize="none"
          autoComplete="username"
          // Shown right after "Buat Akun" is pressed, so typing can start at once.
          autoFocus
          defaultValue={state?.values.username}
          error={errorOf("username")}
          label="Username"
          maxLength={30}
          name="username"
          placeholder="Masukkan Username Anda"
        />
        <TextField
          autoComplete="name"
          defaultValue={state?.values.name}
          error={errorOf("name")}
          label="Nama"
          maxLength={120}
          name="name"
          placeholder="Masukkan nama Anda"
        />
        <TextField
          autoComplete="email"
          defaultValue={state?.values.email}
          error={errorOf("email")}
          label="Email"
          maxLength={255}
          name="email"
          placeholder="Masukkan Email Anda"
          type="email"
        />
        <PasswordField
          autoComplete="new-password"
          error={errorOf("password")}
          label="Password"
          name="password"
          placeholder="Masukkan password Anda"
        />
        <PasswordField
          autoComplete="new-password"
          error={errorOf("passwordConfirmation")}
          label="Konfirmasi Password"
          name="passwordConfirmation"
          placeholder="Masukkan ulang password Anda"
        />
      </div>
      {state?.message && <AuthNoticeMessage notice={{ message: state.message }} />}
      <AuthFootnote>
        Sudah punya akun?{" "}
        <Link className={textLinkClassName} href={authRoles[role].loginPath}>
          Login
        </Link>
      </AuthFootnote>
      <div className="flex justify-end">
        <button className={primaryButtonClassName} disabled={pending} type="submit">
          {pending ? "Memproses..." : "Daftarkan Akun"}
        </button>
      </div>
    </form>
  );
}
