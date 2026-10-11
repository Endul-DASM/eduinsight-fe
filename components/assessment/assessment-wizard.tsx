import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import type { LearningObjectiveOption } from "@/lib/api/curriculum";
import type { AssessmentDetail, QuestionPage, Subject } from "@/lib/api/types";
import { formatSchedule, type WizardStep, wizardSteps } from "@/lib/assessment-form";
import { AssessmentStatusBadge, AssessmentTypeBadge } from "./assessment-badges";
import {
  GenerateQuestionCard,
  ImportLink,
  OfflineModeCard,
  PlatformSourceCards,
  PreviewQuestionCard,
} from "./assessment-mockup";
import { AssessmentSummaryCard } from "./summary-card";
import { InformationStep } from "./steps/information-step";
import { LearningObjectivesStep } from "./steps/learning-objectives-step";
import { QuestionsStep } from "./steps/questions-step";
import { SettingsStep } from "./steps/settings-step";

function StepNav({ slug, assessmentId, step }: { slug: string; assessmentId: string; step: WizardStep }) {
  return (
    <nav aria-label="Langkah Buat Assessment" className="overflow-x-auto">
      <ol className="flex min-w-max gap-2 rounded-full bg-[#eef2f7] p-1">
        {wizardSteps.map((item, index) => {
          const active = item.id === step;
          return (
            <li key={item.id}>
              <Link
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-[0.04em] transition-colors",
                  active ? "bg-white text-[#0058be] shadow-[0_4px_10px_rgba(15,23,42,0.08)]" : "text-[#5c6470] hover:text-[#091426]",
                )}
                href={`/${slug}/assessment/${assessmentId}?step=${item.id}`}
                replace
              >
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full text-[10px]",
                    active ? "bg-[#0058be] text-white" : "bg-white text-[#5c6470]",
                  )}
                >
                  {index + 1}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Buat Assessment wizard (PRD 5.4.2) on one draft: each step saves its part, the summary follows every change.
export function AssessmentWizard({
  slug,
  subject,
  assessment,
  step,
  learningObjectives,
  bank,
}: {
  slug: string;
  subject: Subject;
  assessment: AssessmentDetail;
  step: WizardStep;
  learningObjectives: LearningObjectiveOption[];
  bank: QuestionPage;
}) {
  // A published assessment is read-only until it is unpublished (SRS 7.2).
  const locked = assessment.status !== "draft";

  return (
    <div className="space-y-8 px-5 py-6 sm:px-6 lg:px-10 lg:py-10">
      <section className="space-y-3">
        <Link className="text-sm font-medium text-[#0058be] hover:underline" href={`/${slug}/assessment`}>
          ← Daftar Assessment
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.04em] text-[#1b1b1d]">
            {assessment.title}
          </h1>
          <AssessmentTypeBadge type={assessment.type} />
          <AssessmentStatusBadge status={assessment.status} />
        </div>
        <p className="text-sm text-[#5c6470]">
          {subject.name} · {subject.class.name} · Buka {formatSchedule(assessment.opensAt)}
        </p>
      </section>

      <StepNav assessmentId={assessment.id} slug={slug} step={step} />

      <section className="grid items-start gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          {locked && (
            <p className="rounded-lg bg-[#eef5ff] px-4 py-3 text-sm leading-5 text-[#003a80]">
              Asesmen ini sudah dipublikasikan sehingga tidak dapat diubah.
              {assessment.status === "scheduled" && " Batalkan publikasi untuk mengubahnya sebelum jadwal buka."}
            </p>
          )}

          <Card className="rounded-[14px] shadow-none">
            <CardContent className="p-5">
              {step === "informasi" && (
                <InformationStep assessment={assessment} className={subject.class.name} locked={locked} slug={slug} />
              )}
              {step === "tp" && (
                <LearningObjectivesStep
                  assessment={assessment}
                  learningObjectives={learningObjectives}
                  locked={locked}
                  slug={slug}
                />
              )}
              {step === "soal" && (
                <QuestionsStep assessment={assessment} bank={bank} locked={locked} slug={slug} />
              )}
              {step === "pengaturan" && <SettingsStep assessment={assessment} locked={locked} slug={slug} />}
            </CardContent>
          </Card>

          {step === "soal" && (
            <>
              <ImportLink />
              <PlatformSourceCards />
              <GenerateQuestionCard />
              <PreviewQuestionCard />
            </>
          )}
          {step === "pengaturan" && <OfflineModeCard />}
        </div>

        <AssessmentSummaryCard assessment={assessment} slug={slug} />
      </section>
    </div>
  );
}
