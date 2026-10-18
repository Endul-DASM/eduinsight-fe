"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useState, useTransition } from "react";
import { primaryButtonClassName } from "@/components/auth/styles";
import { greyButtonClassName, iconButtonClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import { saveTypedQuestionsAction } from "@/lib/actions/assessments";
import type { AssessmentDetail, LearningObjectiveRef, Question } from "@/lib/api/types";
import {
  bloomLevels,
  type BuilderMethod,
  builderPath,
  difficultyLabels,
  OPTION_KEYS,
  questionTypeOptions,
  type TypedQuestion,
  validateTypedQuestion,
} from "@/lib/assessment-form";
import { Field, FormMessage, InfoMessage, SelectInput } from "./builder-fields";

let nextKey = 0;
const newKey = () => `q${(nextKey += 1)}`;

function emptyQuestion(objectives: LearningObjectiveRef[]): TypedQuestion {
  return {
    key: newKey(),
    type: "pg",
    stem: "",
    options: ["", ""],
    answerKey: "",
    // With a single TP there is nothing to choose.
    objectiveIds: objectives.length === 1 ? [objectives[0].id] : [],
    bloomLevel: "",
    difficulty: "",
  };
}

function fromQuestion(question: Question): TypedQuestion {
  return {
    key: newKey(),
    id: question.id,
    type: question.type,
    stem: question.stem,
    options: question.options?.map((option) => option.text) ?? ["", ""],
    answerKey: question.answerKey,
    objectiveIds: question.learningObjectives.map((objective) => objective.id),
    bloomLevel: question.bloomLevel ?? "",
    difficulty: question.difficulty ?? "",
  };
}

const textAreaClassName =
  "w-full resize-y rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-[13px] py-3 text-base leading-normal text-[#1b1b1d] outline-none placeholder:text-[#75777d] focus:border-[#0058be] focus:ring-2 focus:ring-[rgba(0,88,190,0.15)]";

function QuestionEditor({
  number,
  question,
  objectives,
  error,
  onChange,
  onRemove,
}: {
  number: number;
  question: TypedQuestion;
  objectives: LearningObjectiveRef[];
  error?: string;
  onChange: (change: Partial<TypedQuestion>) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const [detailsOpen, setDetailsOpen] = useState(Boolean(question.bloomLevel || question.difficulty));

  function setOption(index: number, text: string) {
    onChange({ options: question.options.map((option, current) => (current === index ? text : option)) });
  }

  function removeOption(index: number) {
    const key = OPTION_KEYS[index];
    const answerIndex = OPTION_KEYS.findIndex((option) => option === question.answerKey);
    onChange({
      options: question.options.filter((_, current) => current !== index),
      // Keys follow the order, so the right answer moves up with its option.
      answerKey:
        question.answerKey === key ? "" : answerIndex > index ? OPTION_KEYS[answerIndex - 1] : question.answerKey,
    });
  }

  return (
    <article
      aria-label={`Soal ${number}`}
      className={cn(
        "flex flex-col gap-5 rounded-3xl border bg-[rgba(250,251,253,0.6)] p-6",
        error ? "border-[#dc2626]" : "border-[#d9d9d9]",
      )}
    >
      <p className="px-2 text-base leading-6 text-[#1b1b1d]">Soal {number}</p>

      <SelectInput
        aria-label={`Jenis soal ${number}`}
        onChange={(event) =>
          onChange({
            type: event.target.value as TypedQuestion["type"],
            answerKey: "",
            options: event.target.value === "pg" ? ["", ""] : [],
          })
        }
        value={question.type}
      >
        {questionTypeOptions.map((option) => (
          <option disabled={!option.enabled} key={option.value} value={option.value}>
            {option.enabled ? option.label : `${option.label} (segera tersedia)`}
          </option>
        ))}
      </SelectInput>

      <div className="flex items-start gap-5">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-base font-semibold leading-normal text-black" htmlFor={`${id}-stem`}>
            Tulis Soal di Sini
          </label>
          <textarea
            className={textAreaClassName}
            id={`${id}-stem`}
            maxLength={5000}
            onChange={(event) => onChange({ stem: event.target.value })}
            placeholder="Contoh: Bentuk sederhana dari 2³ × 2⁵ adalah …"
            rows={3}
            value={question.stem}
          />
        </div>
        <button
          aria-label="Tambah gambar (segera tersedia)"
          className={cn(iconButtonClassName, "mt-8 size-9 cursor-not-allowed opacity-40")}
          disabled
          title="Gambar di soal segera tersedia"
          type="button"
        >
          <Image alt="" height={24} src="/assessment/image-plus.svg" width={24} />
        </button>
      </div>

      {question.type === "pg" ? (
        <fieldset className="flex max-w-[480px] flex-col gap-3">
          <legend className="sr-only">Opsi jawaban, tandai yang benar</legend>
          {question.options.map((option, index) => {
            const key = OPTION_KEYS[index];
            return (
              <div className="flex items-center gap-2" key={key}>
                <label
                  className={cn(
                    "flex h-[50px] flex-1 items-center gap-3 rounded-xl border bg-[#fbf8fa] px-[13px] focus-within:border-[#0058be]",
                    question.answerKey === key ? "border-[#0058be] bg-[#e6eff9]" : "border-[#c5c6cd]",
                  )}
                >
                  <input
                    aria-label={`Jawaban benar: opsi ${key}`}
                    checked={question.answerKey === key}
                    className="size-5 shrink-0 accent-[#0058be]"
                    name={`${id}-answer`}
                    onChange={() => onChange({ answerKey: key })}
                    type="radio"
                  />
                  <span className="text-sm font-semibold text-[#45474c]">{key}.</span>
                  <input
                    aria-label={`Opsi ${key}`}
                    className="min-w-0 flex-1 bg-transparent text-base text-[#1b1b1d] outline-none placeholder:text-[#75777d]"
                    maxLength={1000}
                    onChange={(event) => setOption(index, event.target.value)}
                    placeholder="Pilihan"
                    value={option}
                  />
                </label>
                {question.options.length > 2 && (
                  <button
                    aria-label={`Hapus opsi ${key}`}
                    className={cn(iconButtonClassName, "text-lg leading-none")}
                    onClick={() => removeOption(index)}
                    type="button"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
          {question.options.length < OPTION_KEYS.length && (
            <button
              className="flex h-[50px] items-center gap-3 rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-[13px] text-left text-base text-[#75777d] hover:border-[#0058be] hover:text-[#0058be]"
              onClick={() => onChange({ options: [...question.options, ""] })}
              type="button"
            >
              <span aria-hidden className="size-5 rounded-full border-2 border-[#0058be]" />
              Tambah opsi
            </button>
          )}
          <p className="text-[10px] leading-normal text-[#75777d]">Pilih bulatan pada opsi yang merupakan jawaban benar.</p>
        </fieldset>
      ) : (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold leading-normal text-[#1b1b1d]" htmlFor={`${id}-answer`}>
            Kunci Jawaban / Rubrik Penilaian
          </label>
          <textarea
            className={textAreaClassName}
            id={`${id}-answer`}
            maxLength={5000}
            onChange={(event) => onChange({ answerKey: event.target.value })}
            placeholder="Jawaban model atau poin-poin yang dinilai guru"
            rows={3}
            value={question.answerKey}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold leading-normal text-[#1b1b1d]">TP yang diukur</p>
        {objectives.length === 0 ? (
          <p className="text-xs text-[#75777d]">Pilih TP asesmen di langkah Spesifikasi Soal terlebih dahulu.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {objectives.map((objective) => {
              const chosen = question.objectiveIds.includes(objective.id);
              return (
                <button
                  aria-pressed={chosen}
                  className={cn(
                    "rounded-3xl border px-3 py-1 text-xs font-semibold leading-normal transition-colors",
                    chosen
                      ? "border-[#0058be] bg-[#e6eff9] text-[#004695]"
                      : "border-[#c5c6cd] bg-white text-[#45474c] hover:border-[#0058be]",
                  )}
                  key={objective.id}
                  onClick={() =>
                    onChange({
                      objectiveIds: chosen
                        ? question.objectiveIds.filter((entry) => entry !== objective.id)
                        : [...question.objectiveIds, objective.id],
                    })
                  }
                  title={objective.description}
                  type="button"
                >
                  TP {objective.number}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {detailsOpen && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field htmlFor={`${id}-bloom`} label="Level Bloom">
            <SelectInput
              id={`${id}-bloom`}
              onChange={(event) => onChange({ bloomLevel: event.target.value as TypedQuestion["bloomLevel"] })}
              value={question.bloomLevel}
            >
              <option value="">Belum ditentukan</option>
              {bloomLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.value}: {level.label}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field htmlFor={`${id}-difficulty`} label="Tingkat Kesulitan">
            <SelectInput
              id={`${id}-difficulty`}
              onChange={(event) => onChange({ difficulty: event.target.value as TypedQuestion["difficulty"] })}
              value={question.difficulty}
            >
              <option value="">Belum ditentukan</option>
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold leading-normal text-[#dc2626]" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-1 border-t border-[#c5c6cd] pt-4">
        <button aria-label={`Hapus soal ${number}`} className={iconButtonClassName} onClick={onRemove} title="Hapus soal" type="button">
          <Image alt="" height={24} src="/assessment/trash.svg" width={24} />
        </button>
        <button
          aria-expanded={detailsOpen}
          aria-label="Level Bloom dan kesulitan"
          className={iconButtonClassName}
          onClick={() => setDetailsOpen((open) => !open)}
          title="Level Bloom dan kesulitan"
          type="button"
        >
          <Image alt="" height={24} src="/assessment/ellipsis-vertical.svg" width={24} />
        </button>
      </div>
    </article>
  );
}

// Langkah 2 "Ketik di EduInsight" (Figma New Design 61:8772). Each question goes to the Bank Soal with its TP tags
// (FR-G-060, FR-G-065) and joins the assessment in this order (FR-G-043).
export function TypedQuestionsStep({
  slug,
  subjectId,
  method,
  assessment,
}: {
  slug: string;
  subjectId: string;
  method: BuilderMethod;
  assessment: AssessmentDetail;
}) {
  const objectives = assessment.learningObjectives;
  const [questions, setQuestions] = useState<TypedQuestion[]>(() =>
    assessment.questions.length > 0 ? assessment.questions.map(fromQuestion) : [emptyQuestion(objectives)],
  );
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  if (assessment.status !== "draft") {
    return (
      <InfoMessage>
        Asesmen ini sudah dipublikasikan sehingga soalnya tidak dapat diubah.{" "}
        <Link className="font-semibold underline" href={builderPath(slug, assessment.id, method, "review")}>
          Lihat Review
        </Link>
      </InfoMessage>
    );
  }

  function update(key: string, change: Partial<TypedQuestion>) {
    setQuestions((current) => current.map((question) => (question.key === key ? { ...question, ...change } : question)));
    setErrors((current) => ({ ...current, [key]: "" }));
    setMessage(undefined);
    setSaved(false);
  }

  function remove(question: TypedQuestion) {
    setQuestions((current) => current.filter((entry) => entry.key !== question.key));
    if (question.id) setRemovedIds((current) => [...current, question.id!]);
    setSaved(false);
  }

  function save(next: boolean) {
    const found = Object.fromEntries(
      questions.flatMap((question) => {
        const problem = validateTypedQuestion(question);
        return problem ? [[question.key, problem]] : [];
      }),
    );
    setErrors(found);
    setMessage(undefined);
    if (Object.keys(found).length > 0) return setMessage("Periksa lagi soal yang ditandai.");
    if (next && questions.length === 0) return setMessage("Tambahkan minimal satu soal.");

    startTransition(async () => {
      const result = await saveTypedQuestionsAction(slug, subjectId, assessment.id, method, questions, removedIds, next);
      // New questions keep the ids they got, also when a later one failed, so saving again does not duplicate them.
      const ids = result.questionIds ?? {};
      setQuestions((current) => current.map((question) => (ids[question.key] ? { ...question, id: ids[question.key] } : question)));
      if (result.status === "saved") {
        setRemovedIds([]);
        return setSaved(true);
      }
      setErrors(result.fields ?? {});
      setMessage(result.message);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {objectives.length === 0 && (
        <InfoMessage>
          Asesmen ini belum punya TP.{" "}
          <Link className="font-semibold underline" href={builderPath(slug, assessment.id, method, "spesifikasi")}>
            Pilih TP di Spesifikasi Soal
          </Link>{" "}
          agar setiap soal bisa diberi tag TP.
        </InfoMessage>
      )}

      {questions.map((question, index) => (
        <QuestionEditor
          error={errors[question.key] || undefined}
          key={question.key}
          number={index + 1}
          objectives={objectives}
          onChange={(change) => update(question.key, change)}
          onRemove={() => remove(question)}
          question={question}
        />
      ))}

      <button
        className="flex items-center justify-center gap-3 rounded-xl bg-[rgba(153,188,229,0.6)] px-4 py-3 text-base font-semibold leading-normal text-[#004695] transition-colors hover:bg-[rgba(153,188,229,0.85)]"
        onClick={() => {
          setQuestions((current) => [...current, emptyQuestion(objectives)]);
          setSaved(false);
        }}
        type="button"
      >
        <Image alt="" height={24} src="/assessment/circle-plus.svg" width={24} />
        Tambah Pertanyaan
      </button>

      {message && <FormMessage>{message}</FormMessage>}
      {saved && <InfoMessage>Draf tersimpan. Soal juga masuk ke Bank Soal.</InfoMessage>}

      <div className="flex flex-wrap justify-end gap-3">
        <button className={greyButtonClassName} disabled={pending} onClick={() => save(false)} type="button">
          Simpan Draft
        </button>
        <button className={primaryButtonClassName} disabled={pending} onClick={() => save(true)} type="button">
          {pending ? "Menyimpan..." : "Selanjutnya"}
        </button>
      </div>
    </div>
  );
}
