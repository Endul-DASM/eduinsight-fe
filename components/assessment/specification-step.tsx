"use client";

import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { primaryButtonClassName } from "@/components/auth/styles";
import { ObjectivePicker, objectivesOf } from "@/components/curriculum/objective-picker";
import { greyButtonClassName, iconButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { focusFirstError } from "@/components/ui/focus-first-error";
import { saveSpecificationAction } from "@/lib/actions/assessments";
import type { AssessmentDetail, CurriculumChapter } from "@/lib/api/types";
import {
  assessmentTypeLabels,
  assessmentTypes,
  type BuilderMethod,
  builderPath,
  durationParts,
  formatLongSchedule,
  isEditable,
  isoToWibInput,
  type SpecificationErrors,
  type SpecificationValues,
  todayWibInput,
  validateSpecification,
} from "@/lib/assessment-form";
import { saveSummaryPreference, useSummaryPreference } from "@/lib/summary-preference";
import { Field, FormMessage, InfoMessage, SelectInput, TextInput } from "./builder-fields";

function initialValues(assessment: AssessmentDetail | null, initialType: string): SpecificationValues {
  const duration = durationParts(assessment?.durationMinutes ?? null);
  return {
    title: assessment?.title ?? "",
    type: assessment?.type ?? initialType,
    objectiveIds: assessment?.learningObjectives.map((objective) => objective.id) ?? [],
    hours: duration.hours,
    minutes: duration.minutes,
    // Assessments are taken in the app: the Daring/Luring choice was removed (UAT), so every save sends daring.
    mode: "daring",
    opensAt: isoToWibInput(assessment?.opensAt ?? null),
    closesAt: isoToWibInput(assessment?.closesAt ?? null),
    kkm: assessment ? String(assessment.kkm) : "",
    maxAttempts: String(assessment?.maxAttempts ?? 1),
    remedialThreshold: assessment?.remedialThreshold === null || !assessment ? "" : String(assessment.remedialThreshold),
  };
}

// Langkah 1 Spesifikasi Soal (Figma New Design 65:11718), shared by every method: Informasi (FR-G-041), Pilih TP
// (FR-G-042) and Pengaturan (FR-G-044). Jadwal, KKM, percobaan and ambang remedial are not in the design but are
// required by the SRS, so they follow the design's fields.
export function SpecificationStep({
  slug,
  subjectId,
  kkmDefault,
  initialType = "",
  method,
  assessment,
  chapters,
}: {
  slug: string;
  subjectId: string;
  kkmDefault: number;
  // Jenis for a new assessment, e.g. "remedial" when started from the Remedial page.
  initialType?: string;
  method: BuilderMethod;
  assessment: AssessmentDetail | null;
  // Final Babs only: TPs of a draft Bab cannot be tested yet (FR-G-023).
  chapters: CurriculumChapter[];
}) {
  const formId = useId();
  const objectives = objectivesOf(chapters);
  const objectiveById = new Map(objectives.map((objective) => [objective.id, objective]));
  const locked = Boolean(assessment && !isEditable(assessment.status));
  // A scheduled assessment stays published while it is edited, so it must stay complete (UAT ASM-H01).
  const scheduled = assessment?.status === "scheduled";

  const [values, setValues] = useState(() => initialValues(assessment, initialType));
  const [savedOpensAt] = useState(values.opensAt);
  const today = todayWibInput();
  // An older jadwal buka stays selectable until it is changed.
  const minOpensAt = savedOpensAt && savedOpensAt < today ? savedOpensAt : today;
  // The Bab only narrows the TP list; it starts on the Bab of the chosen TPs when they share one.
  const [chapterId, setChapterId] = useState(() => {
    const ids = new Set(values.objectiveIds.map((id) => objectiveById.get(id)?.chapter.id));
    return ids.size === 1 ? ([...ids][0] ?? "") : "";
  });
  const showSummary = useSummaryPreference(assessment?.id ?? null);
  const [errors, setErrors] = useState<SpecificationErrors>({});
  const [message, setMessage] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (name: keyof SpecificationValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSaved(false);
  };

  function toggleObjective(id: string) {
    setValues((current) => ({
      ...current,
      objectiveIds: current.objectiveIds.includes(id)
        ? current.objectiveIds.filter((entry) => entry !== id)
        : [...current.objectiveIds, id],
    }));
    setErrors((current) => ({ ...current, objectiveIds: undefined }));
    setSaved(false);
  }

  function save(next: boolean) {
    const found = validateSpecification(values, next || scheduled, savedOpensAt);
    setErrors(found);
    setMessage(undefined);
    if (Object.keys(found).length > 0) return focusFirstError();
    startTransition(async () => {
      const result = await saveSpecificationAction(slug, subjectId, assessment?.id ?? null, method, values, next);
      if (result.status === "saved") return setSaved(true);
      setErrors((result.fields ?? {}) as SpecificationErrors);
      setMessage(result.fields ? undefined : result.message);
      focusFirstError();
    });
  }

  const field = (name: keyof SpecificationValues | "chapter" | "summary") => `${formId}-${name}`;
  const chosenObjectives = values.objectiveIds
    .map((id) => objectiveById.get(id))
    .filter((objective) => objective !== undefined);

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save(true);
      }}
    >
      {locked && (
        <InfoMessage>
          Asesmen ini sudah dibuka sehingga spesifikasinya tidak dapat diubah.{" "}
          <Link className="font-semibold underline" href={builderPath(slug, assessment!.id, method, "review")}>
            Lihat Review
          </Link>
        </InfoMessage>
      )}
      {scheduled && (
        <InfoMessage>
          Asesmen ini sudah dipublikasikan dan dibuka {formatLongSchedule(assessment!.opensAt)}. Perubahan langsung
          berlaku setelah disimpan, jadi semua isian wajib tetap lengkap.
        </InfoMessage>
      )}
      <fieldset className="flex min-w-0 flex-col gap-4" disabled={locked || pending}>
        <Field error={errors.title} htmlFor={field("title")} label="Judul Asesmen" required>
          <TextInput
            id={field("title")}
            invalid={Boolean(errors.title)}
            maxLength={200}
            onChange={(event) => set("title", event.target.value)}
            placeholder="Contoh: Post-test Bab 1 Eksponen"
            value={values.title}
          />
        </Field>
        <Field error={errors.type} htmlFor={field("type")} label="Jenis Asesmen" required>
          <SelectInput
            id={field("type")}
            invalid={Boolean(errors.type)}
            onChange={(event) => set("type", event.target.value)}
            value={values.type}
          >
            <option value="">Pilih Jenis Asesmen</option>
            {assessmentTypes.map((type) => (
              <option key={type} value={type}>
                {assessmentTypeLabels[type]}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field htmlFor={field("chapter")} label="Bab">
          <SelectInput id={field("chapter")} onChange={(event) => setChapterId(event.target.value)} value={chapterId}>
            <option value="">{chapters.length === 0 ? "Belum ada Bab final di Kurikulum" : "Semua Bab"}</option>
            {[...chapters]
              .sort((a, b) => a.number - b.number)
              .map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  Bab {chapter.number}: {chapter.name}
                </option>
              ))}
          </SelectInput>
        </Field>
        <Field
          error={errors.objectiveIds}
          hint="*Bisa pilih lebih dari 1"
          htmlFor={field("objectiveIds")}
          label="Tujuan Pembelajaran (TP)"
          required
        >
          <ObjectivePicker
            chapterId={chapterId}
            chosen={values.objectiveIds}
            disabled={locked || pending}
            id={field("objectiveIds")}
            invalid={Boolean(errors.objectiveIds)}
            objectives={objectives}
            onToggle={toggleObjective}
            placeholder="Cari dan pilih TP yang diuji..."
          />
        </Field>
        {chosenObjectives.length > 0 && (
          <ul className="flex flex-col gap-3">
            {chosenObjectives.map((objective) => (
              <li className="flex items-center gap-4" key={objective.id}>
                <span aria-hidden className="size-4 shrink-0 rounded-full bg-[#00376f]" />
                <span className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#c5c6cd] bg-[#e6eff9] px-3 py-2 text-base leading-normal text-[#1b1b1d]">
                  <span className="min-w-0 flex-1">
                    TP {objective.number}: {objective.description}
                  </span>
                  {!locked && (
                    <button
                      aria-label={`Hapus TP ${objective.number}`}
                      className={cn(iconButtonClassName, "shrink-0 text-lg leading-none")}
                      onClick={() => toggleObjective(objective.id)}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Field error={errors.hours ?? errors.minutes} label="Durasi Pengerjaan" required>
          <div
            className={cn(
              "flex h-[50px] items-center gap-2 rounded-xl border bg-[#fbf8fa] px-[13px] focus-within:border-[#0058be] focus-within:ring-2 focus-within:ring-[rgba(0,88,190,0.15)]",
              errors.hours ? "border-[#dc2626]" : "border-[#c5c6cd]",
            )}
          >
            <input
              aria-invalid={Boolean(errors.hours ?? errors.minutes) || undefined}
              aria-label="Jam"
              className="w-12 bg-transparent text-center text-base outline-none placeholder:text-[#75777d]/60"
              inputMode="numeric"
              maxLength={2}
              onChange={(event) => set("hours", event.target.value.replace(/\D/g, ""))}
              placeholder="0"
              value={values.hours}
            />
            <span className="text-sm text-[#45474c]">jam :</span>
            <input
              aria-label="Menit"
              className="w-12 bg-transparent text-center text-base outline-none placeholder:text-[#75777d]/60"
              inputMode="numeric"
              maxLength={2}
              onChange={(event) => set("minutes", event.target.value.replace(/\D/g, ""))}
              placeholder="00"
              value={values.minutes}
            />
            <span className="text-sm text-[#45474c]">menit</span>
          </div>
        </Field>
        <Field
          hint="Menampilkan ringkasan kisi-kisi (jumlah soal, estimasi durasi, TP, dan level kognitif) di langkah Review."
          htmlFor={field("summary")}
          label="Tampilkan Ringkasan (Ya/Tidak)"
        >
          <SelectInput
            id={field("summary")}
            onChange={(event) => saveSummaryPreference(assessment?.id ?? null, event.target.value === "ya")}
            value={showSummary ? "ya" : "tidak"}
          >
            <option value="ya">Ya</option>
            <option value="tidak">Tidak</option>
          </SelectInput>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            error={errors.opensAt}
            hint="Waktu Indonesia Barat (WIB)"
            htmlFor={field("opensAt")}
            label="Jadwal Buka"
            required
          >
            <TextInput
              id={field("opensAt")}
              invalid={Boolean(errors.opensAt)}
              min={minOpensAt}
              onChange={(event) => set("opensAt", event.target.value)}
              type="datetime-local"
              value={values.opensAt}
            />
          </Field>
          <Field
            error={errors.closesAt}
            hint="Waktu Indonesia Barat (WIB)"
            htmlFor={field("closesAt")}
            label="Jadwal Tutup"
            required
          >
            <TextInput
              id={field("closesAt")}
              invalid={Boolean(errors.closesAt)}
              min={values.opensAt || minOpensAt}
              onChange={(event) => set("closesAt", event.target.value)}
              type="datetime-local"
              value={values.closesAt}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field error={errors.kkm} hint={`Kosongkan untuk KKM mapel (${kkmDefault})`} htmlFor={field("kkm")} label="KKM">
            <TextInput
              id={field("kkm")}
              inputMode="numeric"
              invalid={Boolean(errors.kkm)}
              onChange={(event) => set("kkm", event.target.value.replace(/\D/g, ""))}
              placeholder={`Contoh: ${kkmDefault}`}
              value={values.kkm}
            />
          </Field>
          <Field error={errors.maxAttempts} htmlFor={field("maxAttempts")} label="Jumlah Percobaan" required>
            <TextInput
              id={field("maxAttempts")}
              inputMode="numeric"
              invalid={Boolean(errors.maxAttempts)}
              onChange={(event) => set("maxAttempts", event.target.value.replace(/\D/g, ""))}
              value={values.maxAttempts}
            />
          </Field>
          <Field
            error={errors.remedialThreshold}
            hint="Opsional, default sama dengan KKM"
            htmlFor={field("remedialThreshold")}
            label="Ambang Remedial"
          >
            <TextInput
              id={field("remedialThreshold")}
              inputMode="numeric"
              invalid={Boolean(errors.remedialThreshold)}
              onChange={(event) => set("remedialThreshold", event.target.value.replace(/\D/g, ""))}
              placeholder="Contoh: 60"
              value={values.remedialThreshold}
            />
          </Field>
        </div>
      </fieldset>

      {message && <FormMessage>{message}</FormMessage>}
      {saved && <InfoMessage>{scheduled ? "Perubahan tersimpan." : "Draf tersimpan."}</InfoMessage>}

      {!locked && (
        <div className="flex flex-wrap justify-end gap-3">
          <button className={greyButtonClassName} disabled={pending} onClick={() => save(false)} type="button">
            {scheduled ? "Simpan Perubahan" : "Simpan Draft"}
          </button>
          <button className={primaryButtonClassName} disabled={pending} type="submit">
            {pending ? "Menyimpan..." : "Selanjutnya"}
          </button>
        </div>
      )}
    </form>
  );
}
