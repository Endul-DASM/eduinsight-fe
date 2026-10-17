"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Field, InfoMessage, SelectInput, TextInput } from "@/components/assessment/builder-fields";
import { PasswordField } from "@/components/auth/password-field";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { greyButtonClassName, sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { Modal } from "@/components/ui/modal";
import type { CurrentUser } from "@/lib/api/types";
import {
  PHOTO_MAX_MB,
  type PasswordErrors,
  type PasswordValues,
  type ProfileErrors,
  type ProfileValues,
  validatePasswordChange,
  validatePhotoFile,
  validatePhotoSize,
  validateProfile,
} from "@/lib/profile-form";
import { provinces } from "@/lib/provinces";

const NOT_READY = "belum bisa disimpan karena backend belum tersedia.";

// Foto profil: a local preview only, the backend has no upload yet.
function PhotoCard({ initials }: { initials: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Free the object URL when it is replaced or the page closes.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

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
      const sizeError = validatePhotoSize(image.naturalWidth, image.naturalHeight);
      if (sizeError) {
        URL.revokeObjectURL(url);
        setError(sizeError);
        return;
      }
      setError(null);
      setPreview(url);
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
        {preview ? (
          // A local object URL; next/image cannot optimize it.
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Pratinjau foto profil" className="size-full object-cover" src={preview} />
        ) : (
          <span className="grid size-full place-items-center text-5xl font-bold text-[#004695]">{initials}</span>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <button className={cn(primaryButtonClassName, "self-start px-4 py-2.5 text-base")} onClick={() => inputRef.current?.click()} type="button">
          Upload Foto Baru
        </button>
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
        {preview && <InfoMessage>Pratinjau foto. Foto profil {NOT_READY}</InfoMessage>}
      </div>
    </section>
  );
}

const emptyPassword: PasswordValues = { current: "", next: "", confirmation: "" };

function PasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [values, setValues] = useState(emptyPassword);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function close() {
    setValues(emptyPassword);
    setErrors({});
    setSubmitted(false);
    onClose();
  }

  const set = (key: keyof PasswordValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = { ...values, [key]: event.target.value };
    setValues(next);
    if (Object.keys(errors).length) setErrors(validatePasswordChange(next));
  };

  return (
    <Modal
      align="start"
      className="max-w-[520px] rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop:bg-[rgba(9,20,38,0.2)] backdrop:backdrop-blur-sm"
      onClose={close}
      open={open}
      showClose
      title="Ubah Password"
    >
      <form
        className="flex flex-col gap-4"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const found = validatePasswordChange(values);
          setErrors(found);
          setSubmitted(Object.keys(found).length === 0);
        }}
      >
        <PasswordField autoComplete="current-password" error={errors.current} label="Password saat ini" name="current" onChange={set("current")} value={values.current} />
        <PasswordField autoComplete="new-password" error={errors.next} label="Password baru" name="next" onChange={set("next")} value={values.next} />
        <PasswordField
          autoComplete="new-password"
          error={errors.confirmation}
          label="Konfirmasi password baru"
          name="confirmation"
          onChange={set("confirmation")}
          value={values.confirmation}
        />
        {submitted && <InfoMessage>Password {NOT_READY}</InfoMessage>}
        <div className="flex justify-end gap-3">
          <button className={cn(outlineButtonClassName, "px-5 py-2 text-sm")} onClick={close} type="button">
            Batal
          </button>
          <button className={cn(primaryButtonClassName, "px-5 py-2 text-sm")} type="submit">
            Simpan Password
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Edit Profile (Figma New Design 187:10583): photo, Personal Info and password. Name and email come from GET /me; the
// backend cannot save any change yet, so saving validates and explains that.
export function ProfileForm({ user }: { user: CurrentUser }) {
  const id = useId();
  const initial: ProfileValues = { name: user.name, email: user.email, province: "" };
  const [values, setValues] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const set = (key: keyof ProfileValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const next = { ...values, [key]: event.target.value };
    setValues(next);
    if (Object.keys(errors).length) setErrors(validateProfile(next));
  };

  function cancel() {
    setValues(initial);
    setErrors({});
    setNotice(null);
    setEditing(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1048px] flex-col gap-6">
      <PhotoCard initials={user.initials} />

      <form
        className={sectionClassName}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const found = validateProfile(values);
          setErrors(found);
          setNotice(Object.keys(found).length ? null : `Perubahan profil ${NOT_READY}`);
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold leading-normal text-black">Personal Info</h3>
          {editing ? (
            <div className="flex gap-3">
              <button className={cn(outlineButtonClassName, "px-4 py-2 text-base")} onClick={cancel} type="button">
                Batal
              </button>
              <button className={cn(primaryButtonClassName, "px-4 py-2 text-base")} type="submit">
                Simpan
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
        <Field error={errors.email} htmlFor={`${id}-email`} label="Email">
          <TextInput
            autoComplete="email"
            disabled={!editing}
            id={`${id}-email`}
            invalid={Boolean(errors.email)}
            onChange={set("email")}
            type="email"
            value={values.email}
          />
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
            <TextInput className="flex-1" disabled id={`${id}-password`} readOnly type="password" value="password" />
            <button className={cn(greyButtonClassName, "shrink-0 px-4 text-base")} onClick={() => setPasswordOpen(true)} type="button">
              Ubah Password
            </button>
          </div>
        </Field>

        {notice && <InfoMessage>{notice}</InfoMessage>}
      </form>

      <PasswordModal onClose={() => setPasswordOpen(false)} open={passwordOpen} />
    </div>
  );
}
