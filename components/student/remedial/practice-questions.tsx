"use client";

import { useState } from "react";
import { cn } from "@/components/ui/cn";
import type { PracticeQuestion } from "@/lib/api/student";

// Soal Latihan (AI-13, FR-G-102): practice questions the teacher approved with the package. A self-check: the
// student picks an answer, then sees whether it is right, the key and the explanation. Nothing is saved or scored.
export function PracticeQuestions({ questions }: { questions: PracticeQuestion[] }) {
  if (questions.length === 0) return null;
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-[#fafbfd] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
      <div className="leading-normal">
        <p className="text-xl font-semibold text-[#1b1b1d]">Soal Latihan</p>
        <p className="text-sm text-[#45474c]">Latihan mandiri, tidak dinilai. Pilih jawaban, lalu cek pembahasannya.</p>
      </div>
      <ol className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <PracticeItem key={question.id} number={index + 1} question={question} />
        ))}
      </ol>
    </div>
  );
}

function PracticeItem({ question, number }: { question: PracticeQuestion; number: number }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = picked === question.answerKey;

  return (
    <li className="flex flex-col gap-2 text-sm leading-normal">
      <p className="whitespace-pre-line text-[#1b1b1d]">
        <span className="font-semibold">{number}.</span> {question.stem}
      </p>
      <fieldset className="flex flex-col gap-1.5" disabled={checked}>
        <legend className="sr-only">Pilihan soal {number}</legend>
        {(question.options ?? []).map((option) => (
          <label
            className={cn(
              "flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2",
              checked && option.key === question.answerKey
                ? "border-[#16a34a] bg-[#dcfce7]"
                : checked && option.key === picked
                  ? "border-[#dc2626] bg-[#fee2e2]"
                  : picked === option.key
                    ? "border-[#0058be] bg-[#e6eff9]"
                    : "border-[#c5c6cd] bg-white",
            )}
            key={option.key}
          >
            <input
              checked={picked === option.key}
              className="mt-1 accent-[#0058be]"
              name={`practice-${question.id}`}
              onChange={() => setPicked(option.key)}
              type="radio"
            />
            <span>
              {option.key}. {option.text}
            </span>
          </label>
        ))}
      </fieldset>
      {checked ? (
        <div className={cn("rounded-xl px-3 py-2", correct ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]")}>
          <p className="font-semibold">{correct ? "Benar!" : `Belum tepat. Jawaban yang benar: ${question.answerKey}.`}</p>
          {question.explanation && <p className="text-[#1b1b1d]">{question.explanation}</p>}
          <button
            className="mt-1 text-xs font-semibold text-[#0058be] hover:underline"
            onClick={() => {
              setPicked(null);
              setChecked(false);
            }}
            type="button"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <button
          className="self-start rounded-xl bg-[#0058be] px-4 py-2 text-xs font-semibold text-[#f5f3f4] hover:bg-[#004695] disabled:opacity-50"
          disabled={!picked}
          onClick={() => setChecked(true)}
          type="button"
        >
          Cek jawaban
        </button>
      )}
    </li>
  );
}
