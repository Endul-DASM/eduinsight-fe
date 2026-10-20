import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

// A question as the teacher reviews it (Figma New Design 61:5079, 61:7934): chips, stem and options with the key
// marked. An essay shows its model answer instead of options.
export function QuestionCard({
  title,
  chips = [],
  stem,
  options,
  answer,
  actions,
  badge,
  footer,
  bare = false,
  className,
}: {
  title?: string;
  chips?: string[];
  stem: string;
  options: { key: string; text: string }[] | null;
  // The key of the right option, or an essay's model answer / rubric.
  answer: string;
  actions?: ReactNode;
  // E.g. "Menunggu ACC" on an AI draft.
  badge?: ReactNode;
  // Below the answer, e.g. an AI draft's explanation.
  footer?: ReactNode;
  // Without its own border, e.g. inside the example card.
  bare?: boolean;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-5 text-left",
        !bare && "rounded-3xl border border-[#d9d9d9] bg-[rgba(250,251,253,0.6)] p-6",
        className,
      )}
    >
      {(title || actions || badge) && (
        <div className="flex items-center justify-between gap-3 px-2">
          <p className="flex items-center gap-3 text-base leading-6 text-[#1b1b1d]">
            {title}
            {badge}
          </p>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span className="rounded-3xl bg-[#e6eff9] px-2 py-1 text-xs font-semibold leading-normal text-[#004695]" key={chip}>
              {chip}
            </span>
          ))}
        </div>
      )}
      <p className="whitespace-pre-line text-base leading-normal text-[#1b1b1d]">{stem}</p>
      {options ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => {
            const right = option.key === answer;
            return (
              <li
                className={cn(
                  "flex min-h-[50px] items-center justify-between gap-2 rounded-xl border px-[13px] py-3 text-base leading-normal text-[#1b1b1d]",
                  right ? "border-[#0058be] bg-[#e6eff9]" : "border-[#c5c6cd]",
                )}
                key={option.key}
              >
                <span>
                  {option.key}. {option.text}
                </span>
                {right && <Image alt="Jawaban benar" height={12} src="/assessment/check-circle.svg" width={12} />}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-xl border border-[#0058be] bg-[#e6eff9] px-[13px] py-3 text-sm leading-normal text-[#1b1b1d]">
          <p className="text-xs font-semibold text-[#004695]">Kunci jawaban / rubrik</p>
          <p className="whitespace-pre-line">{answer}</p>
        </div>
      )}
      {footer}
    </article>
  );
}
