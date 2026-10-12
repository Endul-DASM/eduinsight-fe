import { Fragment, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";
import { type BuilderMethod, builderMethods, type BuilderStep } from "@/lib/assessment-form";

function Stepper({ method, step }: { method: BuilderMethod; step: BuilderStep }) {
  const steps = ["Spesifikasi Soal", builderMethods[method].questionsStep, "Review"];
  const current = step === "spesifikasi" ? 0 : step === "soal" ? 1 : 2;

  return (
    <ol className="flex items-center gap-3 text-xs font-semibold leading-normal sm:gap-6">
      {steps.map((label, index) => {
        const reached = index <= current;
        return (
          <Fragment key={label}>
            {index > 0 && (
              <li aria-hidden className={cn("h-0.5 min-w-4 flex-1", reached ? "bg-[#0058be]" : "bg-[#c5c6cd]")} />
            )}
            <li
              aria-current={index === current ? "step" : undefined}
              className={cn("flex shrink-0 items-center gap-2", reached ? "text-[#0058be]" : "text-[#75777d]")}
            >
              <span
                className={cn(
                  "grid size-12 place-items-center rounded-full text-base",
                  reached ? "bg-[#0058be] text-[#f5f3f4]" : "bg-[#c5c6cd] text-[#45474c]",
                )}
              >
                {index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

// The page around the three Buat Asesmen steps (Figma New Design 65:11718, 61:8772): title, glass card, stepper.
// The publishing and done screens use the card without the stepper.
export function BuilderShell({
  method,
  step,
  children,
}: {
  method: BuilderMethod;
  step: BuilderStep;
  children: ReactNode;
}) {
  const plain = step === "selesai";

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <h2 className="text-2xl font-semibold leading-normal text-[#003264]">{builderMethods[method].title}</h2>
      <section
        className={cn(
          "flex flex-col gap-6 rounded-3xl bg-[rgba(250,251,253,0.6)] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs",
          plain && "min-h-[495px] justify-center",
        )}
      >
        {!plain && <Stepper method={method} step={step} />}
        {children}
      </section>
    </div>
  );
}

// "Soal sedang dipublikasi…" (Figma New Design 61:6405) and other waits that take over the card.
export function BuilderWait({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-center" role="status">
      <span className="size-8 animate-spin rounded-full border-[3px] border-[#e6eff9] border-t-[#0058be]" />
      <p className="text-xl font-semibold leading-normal text-black">{title}</p>
      <p className="text-sm leading-normal text-[#75777d]">{description}</p>
    </div>
  );
}
