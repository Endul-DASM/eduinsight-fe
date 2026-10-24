"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { SetPasswordForm } from "@/components/account/set-password-form";
import { Field, FormMessage, InfoMessage, SelectInput, TextInput } from "@/components/assessment/builder-fields";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { greyButtonClassName, sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/modal";
import { deletePhotoAction, type ProfileActionResult, saveProfileAction, uploadPhotoAction } from "@/lib/actions/profile";
import type { CurrentUser } from "@/lib/api/types";
import {
  PHOTO_MAX_MB,
  profilePhotoUrl,
  type ProfileErrors,
  type ProfileValues,
  validatePhotoFile,
  validatePhotoSize,
  validateProfile,
} from "@/lib/profile-form";
import { provinces } from "@/lib/provinces";

// Foto profil: PUT /me/photo once the browser has checked the type, size and dimensions; DELETE /me/photo removes it.
function PhotoCard({ user }: { user: CurrentUser }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const photo = profilePhotoUrl(user.photoUpdatedAt);

  function send(request: () => Promise<ProfileActionResult>) {
    startTransition(async () => {
      const result = await request();
      if (result.status === "error") setError(result.message);
      else {
        setError(null);
        router.refresh();
      }
    });
  }

  function pick(file: File | undefined) {
    if (!file) return;
    const typeError = validatePhotoFile(file);
    if (typeError) {
      setError(typeError);
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      const sizeError = validatePhotoSize(image.naturalWidth, image.naturalHeight);
      if (sizeError) {
        setError(sizeError);
        return;
      }
      const form = new FormData();
      form.set("file", file);
      send(() => uploadPhotoAction(form));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError("Foto tidak dapat dibaca.");
    };
    image.src = url;
  }

  return (
    <section className={cn(sectionClassName, "flex-row flex-wrap items-center gap-8")}>
      <div className="size-[180px] shrink-0 overflow-hidden rounded-full bg-[#e6eff9]">
        {photo ? (
          // Served by app/api/me/photo with the session token; next/image would fetch it without the cookie.
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Foto profil" className="size-full object-cover" src={photo} />
        ) : (
          <span className="grid size-full place-items-center text-5xl font-bold text-[#004695]">{user.initials}</span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            className={cn(primaryButtonClassName, "px-4 py-2.5 text-base")}
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            {pending ? "Menyimpan..." : "Upload Foto Baru"}
          </button>
          {photo && (
            <button
              className={cn(outlineButtonClassName, "px-4 py-2.5 text-base")}
              disabled={pending}
              onClick={() => send(deletePhotoAction)}
              type="button"
            >
              Hapus Foto
            </button>
          )}
        </div>
        <input
          accept="image/jpeg,image/png"
          aria-label="Pilih foto profil"
          className="hidden"
          onChange={(event) => {
            pick(event.target.files?.[0]);
            event.target.value = "";
          }}
          ref={inputRef}
          type="file"
        />
        <p className="text-xs text-[#45474c]">Minimal 800 x 800. JPG atau PNG, maksimal {PHOTO_MAX_MB} MB.</p>
        {error && (
          <p className="text-xs font-semibold text-[#dc2626]" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}

// Ubah Password (POST /auth/password/change) or, for a Google-only account, Buat Password (POST /auth/password/set).
// Either signs out the other sessions. The mode is fixed when the modal opens, so a new password keeps its success
// message even though the page then reloads with hasPassword set.
function PasswordModal({ mode, onClose }: { mode: "change" | "set" | null; onClose: () => void }) {
  return (
    <Modal
      align="start"
      className="max-w-[520px] rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop:bg-[rgba(9,20,38,0.2)] backdrop:backdrop-blur-sm"
      onClose={onClose}
      open={mode !== null}
      showClose
      title={mode === "set" ? "Buat Password" : "Ubah Password"}
    >
      {/* Mounted only while open, so the fields and the last message reset each time. */}
      {mode === "change" && <ChangePasswordForm />}
      {mode === "set" && <SetPasswordForm />}
    </Modal>
  );
}

// Edit Profile (Figma New Design 187:10583): photo, Personal Info and password, from GET /me. Name and province are
// saved with PATCH /me; the email is read-only.
export function ProfileForm({ user }: { user: CurrentUser }) {
  const id = useId();
  const router = useRouter();
  const initial: ProfileValues = { name: user.name, province: user.province ?? "" };
  const [values, setValues] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [passwordMode, setPasswordMode] = useState<"change" | "set" | null>(null);
  // An older backend does not send hasPassword; every account there has a password.
  const hasPassword = user.hasPassword !== false;

  const set = (key: keyof ProfileValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const next = { ...values, [key]: event.target.value };
    setValues(next);
    if (Object.keys(errors).length) setErrors(validateProfile(next));
  };

  function cancel() {
    setValues(initial);
    setErrors({});
    setNotice(null);
    setFailure(null);
    setEditing(false);
  }

  function save() {
    const found = validateProfile(values);
    setErrors(found);
    setNotice(null);
    setFailure(null);
    if (Object.keys(found).length) return;
    startTransition(async () => {
      const result = await saveProfileAction(values);
      if (result.status === "error") {
        setErrors(result.fields ?? {});
        setFailure(result.message);
        return;
      }
      setEditing(false);
      setNotice("Profil tersimpan.");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1048px] flex-col gap-6">
      <PhotoCard user={user} />

      <form
        className={sectionClassName}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold leading-normal text-black">Personal Info</h3>
          {editing ? (
            <div className="flex gap-3">
              <button className={cn(outlineButtonClassName, "px-4 py-2 text-base")} disabled={pending} onClick={cancel} type="button">
                Batal
              </button>
              <button className={cn(primaryButtonClassName, "px-4 py-2 text-base")} disabled={pending} type="submit">
                {pending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          ) : (
            <button
              className={cn(outlineButtonClassName, "px-4 py-2 text-base")}
              onClick={() => {
                setNotice(null);
                setEditing(true);
              }}
              type="button"
            >
              Edit Profil
            </button>
          )}
        </div>

        <Field error={errors.name} htmlFor={`${id}-name`} label="Nama">
          <TextInput
            autoComplete="name"
            disabled={!editing}
            id={`${id}-name`}
            invalid={Boolean(errors.name)}
            onChange={set("name")}
            value={values.name}
          />
        </Field>
        <Field hint={editing ? "Email tidak dapat diubah." : undefined} htmlFor={`${id}-email`} label="Email">
          <TextInput autoComplete="email" disabled id={`${id}-email`} readOnly type="email" value={user.email} />
        </Field>
        <Field error={errors.province} hint="Opsional" htmlFor={`${id}-province`} label="Provinsi">
          <SelectInput
            disabled={!editing}
            id={`${id}-province`}
            invalid={Boolean(errors.province)}
            onChange={set("province")}
            value={values.province}
          >
            <option value="">Pilih Provinsi</option>
            {provinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field htmlFor={`${id}-password`} label="Password">
          <div className="flex gap-3">
            {hasPassword ? (
              <TextInput className="flex-1" disabled id={`${id}-password`} readOnly type="password" value="password" />
            ) : (
              <TextInput className="flex-1" disabled id={`${id}-password`} readOnly value="Masuk dengan Google" />
            )}
            {/* Blue while Personal Info is being edited, like the other active controls (UAT AUTH-H05). */}
            <button
              className={cn(editing ? primaryButtonClassName : greyButtonClassName, "shrink-0 px-4 text-base")}
              onClick={() => setPasswordMode(hasPassword ? "change" : "set")}
              type="button"
            >
              {hasPassword ? "Ubah Password" : "Buat Password"}
            </button>
          </div>
        </Field>

        {failure && <FormMessage>{failure}</FormMessage>}
        {notice && <InfoMessage>{notice}</InfoMessage>}
      </form>

      <PasswordModal mode={passwordMode} onClose={() => setPasswordMode(null)} />
    </div>
  );
}
