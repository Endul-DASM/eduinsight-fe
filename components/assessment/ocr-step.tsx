"use client";

import Link from "next/link";
import { useEffect, useId, useState, useTransition } from "react";
import { primaryButtonClassName } from "@/components/auth/styles";
import { greyButtonClassName } from "@/components/curriculum/styles";
import { scanQuestionsAction } from "@/lib/actions/assessments";
import type { QuestionImport } from "@/lib/api/questions";
import type { AssessmentDetail } from "@/lib/api/types";
import type { BuilderMethod } from "@/lib/assessment-form";
import { Field, FormMessage } from "./builder-fields";
import { ImportReview } from "./import-review";
import { UploadBar } from "./upload-bar";

const ACCEPTED = ".pdf,.jpg,.jpeg,.png";
const MAX_SCAN_MB = 25;

// Langkah 2 OCR (Figma New Design 61:9950; FR-G-062, FR-G-063): upload the scan, check it in the preview, then the
// backend reads the questions out of it. The reading is not in the backend yet (OCR_READY); its result will come
// back like a template import and is reviewed the same way.
export function OcrStep({
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
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [pending, startTransition] = useTransition();

  // The preview URL lives as long as the file is chosen.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function choose(chosen: File) {
    setMessage(undefined);
    if (!/\.(pdf|jpe?g|png)$/i.test(chosen.name)) return setMessage("Unggah berkas PDF, JPG, atau PNG.");
    if (chosen.size > MAX_SCAN_MB * 1024 * 1024) return setMessage(`Ukuran berkas maksimal ${MAX_SCAN_MB} MB.`);
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  }

  function scan() {
    setMessage(undefined);
    if (!file) return setMessage("Unggah dokumen hasil scan terlebih dahulu.");
    const form = new FormData();
    form.set("file", file);
    startTransition(async () => {
      const outcome = await scanQuestionsAction(slug, subjectId, assessment.id, method, form);
      if (outcome.status === "error") setMessage(outcome.message);
    });
  }

  if (result) return <ImportReview assessment={assessment} key={result.id} method={method} result={result} slug={slug} />;

  return (
    <div className="flex flex-col gap-4">
      <Field hint={`PDF, JPG, atau PNG, maksimal ${MAX_SCAN_MB} MB.`} htmlFor={id} label="Upload Dokumen Hasil Scan">
        <UploadBar
          accept={ACCEPTED}
          disabled={pending}
          fileName={file?.name}
          id={id}
          onFile={choose}
          placeholder="Pilih dokumen hasil scan..."
        />
      </Field>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold leading-normal text-[#1b1b1d]">Preview Hasil Scan</p>
        <div
          className="h-[300px] overflow-hidden rounded-xl bg-[#fafafa] sm:h-[420px]"
          style={
            preview
              ? undefined
              : {
                  backgroundImage:
                    "linear-gradient(45deg,#ebebeb 25%,transparent 25%,transparent 75%,#ebebeb 75%),linear-gradient(45deg,#ebebeb 25%,transparent 25%,transparent 75%,#ebebeb 75%)",
                  backgroundPosition: "0 0, 32px 32px",
                  backgroundSize: "64px 64px",
                }
          }
        >
          {preview &&
            (file?.type === "application/pdf" ? (
              <iframe className="size-full" src={preview} title="Preview dokumen hasil scan" />
            ) : (
              // A local object URL, which next/image cannot optimize.
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Preview dokumen hasil scan" className="size-full object-contain" src={preview} />
            ))}
        </div>
      </div>

      {message && <FormMessage>{message}</FormMessage>}

      <div className="flex flex-wrap justify-end gap-3">
        <Link className={greyButtonClassName} href={`/${slug}/assessment?tab=daftar`}>
          Simpan Draft
        </Link>
        <button className={primaryButtonClassName} disabled={pending} onClick={scan} type="button">
          {pending ? "Membaca dokumen..." : "Selanjutnya"}
        </button>
      </div>
    </div>
  );
}
