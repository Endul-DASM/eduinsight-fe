"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { Field, FormMessage, InfoMessage, SelectInput, TextInput } from "@/components/assessment/builder-fields";
import { cn } from "@/components/ui/cn";
import { type PublishState, scheduleRemedialAction } from "@/lib/actions/assessments";
import type { Assessment } from "@/lib/api/types";
import { cardStatus, isoToWibInput } from "@/lib/assessment-form";
import type { RemedialScheduleErrors, RemedialScheduleValues } from "@/lib/remedial-figures";

function initialValues(remedial: Assessment): RemedialScheduleValues {
  const opens = isoToWibInput(remedial.opensAt);
  const closes = isoToWibInput(remedial.closesAt);
  return {
    title: remedial.title,
    date: opens.slice(0, 10),
    start: opens.slice(11, 16),
    end: closes.slice(11, 16),
    duration: remedial.durationMinutes ? String(remedial.durationMinutes) : "",
  };
}

// "Remedial berikutnya" (Figma New Design 86:10467): schedule the chosen remedial assessment and publish it.
// Instruksi untuk siswa has no backend field yet, and access is not limited to Perlu Remedial students (FR-G-105).
export function ScheduleForm({
  slug,
  sourceId,
  remedials,
  remedial,
}: {
  slug: string;
  sourceId: string | null;
  remedials: Assessment[];
  remedial: Assessment;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const id = useId();
  const locked = remedial.status !== "draft";
  const [values, setValues] = useState(() => initialValues(remedial));
  const [errors, setErrors] = useState<RemedialScheduleErrors>({});
  const [state, setState] = useState<PublishState>();
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (name: keyof RemedialScheduleValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSaved(false);
  };

  function pick(remedialId: string) {
    const params = new URLSearchParams({ remedial: remedialId });
    if (sourceId) params.set("source", sourceId);
    router.replace(`${pathname}?${params}`, { scroll: false });
  }

  function save(publish: boolean) {
    setState(undefined);
    setSaved(false);
    startTransition(async () => {
      const result = await scheduleRemedialAction(slug, remedial.id, values, publish);
      if (result?.status === "error") {
        setErrors((result.fields ?? {}) as RemedialScheduleErrors);
        setState(result);
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  const field = (name: string) => `${id}-${name}`;

  return (
    <section className="flex flex-col gap-4 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-base font-semibold leading-normal text-[#1b1b1d]">
          <Image alt="" height={22} src="/assessment/calendar-days.svg" width={22} />
          Remedial berikutnya
        </h3>
        <span className={cn("rounded-3xl px-2 py-1 text-xs font-semibold", cardStatus[remedial.status].className)}>
          {cardStatus[remedial.status].label}
        </span>
      </div>

      <fieldset className="flex min-w-0 flex-col gap-4" disabled={pending}>
        <Field
          hint={locked ? "Asesmen ini sudah dipublikasikan; batalkan publikasi di Daftar Asesmen untuk mengubah jadwal." : undefined}
          htmlFor={field("paket")}
          label="Paket soal"
        >
          <SelectInput id={field("paket")} onChange={(event) => pick(event.target.value)} value={remedial.id}>
            {remedials.map((assessment) => (
              <option key={assessment.id} value={assessment.id}>
                {assessment.title} ({assessment.questionCount} soal, {cardStatus[assessment.status].label})
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field error={errors.title} htmlFor={field("title")} label="Nama Remedial">
          <TextInput
            disabled={locked}
            id={field("title")}
            invalid={Boolean(errors.title)}
            maxLength={200}
            onChange={(event) => set("title", event.target.value)}
            value={values.title}
          />
        </Field>
        <Field error={errors.date} hint="Waktu Indonesia Barat (WIB)" htmlFor={field("date")} label="Tanggal pelaksanaan">
          <TextInput
            disabled={locked}
            id={field("date")}
            invalid={Boolean(errors.date)}
            onChange={(event) => set("date", event.target.value)}
            type="date"
            value={values.date}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field error={errors.start} htmlFor={field("start")} label="Waktu mulai">
            <TextInput
              disabled={locked}
              id={field("start")}
              invalid={Boolean(errors.start)}
              onChange={(event) => set("start", event.target.value)}
              type="time"
              value={values.start}
            />
          </Field>
          <Field error={errors.end} htmlFor={field("end")} label="Waktu selesai">
            <TextInput
              disabled={locked}
              id={field("end")}
              invalid={Boolean(errors.end)}
              onChange={(event) => set("end", event.target.value)}
              type="time"
              value={values.end}
            />
          </Field>
          <Field error={errors.duration} htmlFor={field("duration")} label="Durasi (menit)">
            <TextInput
              disabled={locked}
              id={field("duration")}
              inputMode="numeric"
              invalid={Boolean(errors.duration)}
              onChange={(event) => set("duration", event.target.value.replace(/\D/g, ""))}
              placeholder="60"
              value={values.duration}
            />
          </Field>
        </div>
        <Field hint="Segera tersedia: backend belum menyimpan instruksi asesmen." htmlFor={field("instruksi")} label="Instruksi untuk siswa">
          <TextInput disabled id={field("instruksi")} placeholder="Pelajari materi rujukan dan kerjakan seluruh soal secara mandiri." />
        </Field>
      </fieldset>

      <InfoMessage>
        Soal tampil saat jadwal dimulai. Untuk sementara asesmen remedial terlihat oleh semua siswa terdaftar; pembatasan
        hanya untuk siswa Perlu Remedial (FR-G-105) menunggu dukungan backend.
      </InfoMessage>

      {state?.status === "error" && (
        <FormMessage>
          <p>{state.message}</p>
          {state.problems && state.problems.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {state.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          )}
        </FormMessage>
      )}
      {saved && <InfoMessage>{remedial.status === "draft" ? "Draf jadwal tersimpan." : "Remedial dijadwalkan."}</InfoMessage>}

      {!locked && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button className={cn(outlineButtonClassName, "px-4 py-2 text-sm")} disabled={pending} onClick={() => save(false)} type="button">
            Simpan draf
          </button>
          <div className="flex items-center gap-3">
            <Link className="text-sm font-semibold text-[#0058be] hover:underline" href={`/${slug}/assessment/${remedial.id}?method=ketik&step=soal`}>
              Edit soal
            </Link>
            <button className={primaryButtonClassName} disabled={pending} onClick={() => save(true)} type="button">
              {pending ? "Menyimpan..." : "Jadwalkan Remedial"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
