"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { importQuestionsAction } from "@/lib/actions/assessments";
import type { QuestionImport } from "@/lib/api/questions";
import type { AssessmentDetail } from "@/lib/api/types";
import { type BuilderMethod, builderPath, MAX_IMPORT_MB } from "@/lib/assessment-form";
import { Field, FormMessage, InfoMessage } from "./builder-fields";
import { ImportReview } from "./import-review";
import { UploadBar } from "./upload-bar";

// Langkah 2 Template (FR-G-061, FR-G-063, FR-G-064): download the fixed template, fill it in, upload it, then keep
// the questions that were read right. The import is kept in the URL (?import=id) so a reload shows it again.
export function TemplateStep({
  slug,
  subjectId,
  method,
  assessment,
  result,
}: {
  slug: string;
  subjectId: string;
  method: BuilderMethod;
  assessment: AssessmentDetail;
  result: QuestionImport | null;
}) {
  const id = useId();
  const [fileName, setFileName] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  function upload(file: File) {
    setFileName(file.name);
    setMessage(undefined);
    const form = new FormData();
    form.set("file", file);
    startTransition(async () => {
      const outcome = await importQuestionsAction(slug, subjectId, assessment.id, method, form);
      if (outcome.status === "error") setMessage(outcome.message);
    });
  }

  const templateHref = (format: "xlsx" | "csv") => `/api/subjects/${subjectId}/question-template?format=${format}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-[#d9d9d9] bg-[rgba(250,251,253,0.6)] p-6">
        <div className="flex items-start gap-4">
          <span className="grid shrink-0 place-items-center rounded-full bg-[rgba(153,188,229,0.6)] p-3">
            <Image alt="" height={32} src="/assessment/sheet.svg" width={32} />
          </span>
          <div className="flex flex-col gap-1 text-sm leading-normal text-[#45474c]">
            <p className="text-base font-semibold text-[#1b1b1d]">Template Soal</p>
            <p>
              Satu baris untuk satu soal. Kolom <b>tipe</b> diisi PG atau Uraian (Essay), <b>soal</b>, <b>opsi_a</b> sampai{" "}
              <b>opsi_e</b> (khusus PG), <b>kunci</b> (huruf opsi untuk PG, jawaban model untuk uraian), <b>tp</b>{" "}
              (nomor TP, mis. 1.2; pisahkan dengan titik koma bila lebih dari satu), serta <b>bloom</b> dan{" "}
              <b>kesulitan</b> yang opsional.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a className={cn(primaryButtonClassName, "gap-3")} download href={templateHref("xlsx")}>
            Unduh Template Excel
          </a>
          <a className={outlineButtonClassName} download href={templateHref("csv")}>
            Unduh Template CSV
          </a>
        </div>
      </div>

      <Field
        hint={`Berkas .xlsx atau .csv dari template, maksimal ${MAX_IMPORT_MB} MB dan 500 soal.`}
        htmlFor={id}
        label="Upload Template yang Sudah Diisi"
      >
        <UploadBar
          accept=".xlsx,.csv"
          disabled={pending}
          fileName={pending ? `Membaca ${fileName}...` : fileName}
          id={id}
          onFile={upload}
          placeholder="Pilih berkas template..."
        />
      </Field>
      {message && <FormMessage>{message}</FormMessage>}

      {result ? (
        <ImportReview assessment={assessment} key={result.id} method={method} result={result} slug={slug} />
      ) : (
        assessment.questions.length > 0 && (
          <div className="flex flex-col gap-4">
            <InfoMessage>
              Asesmen ini sudah punya {assessment.questions.length} soal. Unggah template lagi untuk menambah soal,
              atau lanjut ke Review.
            </InfoMessage>
            <div className="flex justify-end">
              <Link className={primaryButtonClassName} href={builderPath(slug, assessment.id, method, "review")}>
                Selanjutnya
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
}
