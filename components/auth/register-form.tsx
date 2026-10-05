"use client";

import Link from "next/link";
import { type FormEvent, useActionState, useState } from "react";
import { register } from "@/lib/actions/auth";
import { type AuthRole, authRoles } from "@/lib/auth/roles";
import { type FieldErrors, type RegisterValues, validateRegister } from "@/lib/auth/validation";
import { AuthCard } from "./auth-card";
import { AuthNoticeMessage } from "./auth-notice";
import { PasswordField } from "./password-field";
import { primaryButtonClassName } from "./styles";
import { TextField } from "./text-field";

function valuesOf(form: HTMLFormElement): RegisterValues {
  const data = new FormData(form);
  const value = (name: string) => String(data.get(name) ?? "");
  return {
    username: value("username").trim(),
    email: value("email").trim(),
    password: value("password"),
    passwordConfirmation: value("passwordConfirmation"),
  };
}

export function RegisterForm({ role }: { role: AuthRole }) {
  const [state, formAction, pending] = useActionState(register, undefined);
  // Checked in the browser before submitting; the Server Function repeats the same rules.
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  if (state?.status === "sent") {
    return (
      <AuthCard>
        <div className="flex flex-col gap-2 text-center" role="status">
          <p className="text-base font-semibold text-[#111c2d]">Akun berhasil dibuat</p>
          <p className="text-sm leading-5 text-[#45474c]">
            Kami telah mengirim tautan verifikasi ke <span className="font-semibold">{state.email}</span>. Buka email
            tersebut untuk mengaktifkan akun Anda, lalu masuk.
          </p>
        </div>
        <Link className={`${primaryButtonClassName} self-center`} href={authRoles[role].loginPath}>
          Ke Halaman Masuk
        </Link>
      </AuthCard>
    );
  }

  const serverErrors = state?.fields ?? {};
  const errorOf = (field: keyof FieldErrors) => clientErrors[field] ?? serverErrors[field];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const errors = validateRegister(valuesOf(event.currentTarget));
    setClientErrors(errors);
    if (Object.keys(errors).length > 0) event.preventDefault();
  }

  return (
    <AuthCard>
      <form action={formAction} className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
        <input name="role" type="hidden" value={role} />
        <div className="flex flex-col gap-3">
          <TextField
            autoCapitalize="none"
            autoComplete="username"
            defaultValue={state?.values.username}
            error={errorOf("username")}
            label="Username"
            maxLength={30}
            name="username"
            placeholder="contoh: andi.pratama"
          />
          <TextField
            autoComplete="email"
            defaultValue={state?.values.email}
            error={errorOf("email")}
            label="Email"
            maxLength={255}
            name="email"
            placeholder="nama@sekolah.id"
            type="email"
          />
          <PasswordField
            autoComplete="new-password"
            error={errorOf("password")}
            label="Password"
            name="password"
            placeholder="Minimal 8 karakter"
          />
          <PasswordField
            autoComplete="new-password"
            error={errorOf("passwordConfirmation")}
            label="Konfirmasi Password"
            name="passwordConfirmation"
            placeholder="Ulangi kata sandi"
          />
        </div>
        {state?.message && <AuthNoticeMessage notice={{ message: state.message }} />}
        <div className="flex justify-end">
          <button className={primaryButtonClassName} disabled={pending} type="submit">
            {pending ? "Memproses..." : "Daftarkan Akun"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}
