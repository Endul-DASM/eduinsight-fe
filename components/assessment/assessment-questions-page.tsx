import Image from "next/image";
import Link from "next/link";
import { primaryButtonClassName } from "@/components/auth/styles";
import { sectionClassName } from "@/components/curriculum/styles";
import { cn } from "@/components/ui/cn";
import type { AssessmentDetail, CurriculumTree, Subject } from "@/lib/api/types";
import { chapterLabels } from "@/lib/assessment-list";
import { assessmentModeLabels, assessmentTypeLabels, formatLongSchedule } from "@/lib/assessment-form";
import { PrintButton } from "./print-button";
import { QuestionCard } from "./question-card";

// Lihat Soal (Figma New Design 61:7050): the questions of one assessment as students see them, with the key marked.
// "Unduh Soal" prints the page (Save as PDF): the questions without keys, then the answer keys on their own page.
export function AssessmentQuestionsPage({
  slug,
  subject,
  assessment,
  tree,
}: {
  slug: string;
  subject: Subject;
  assessment: AssessmentDetail;
  tree: CurriculumTree | null;
}) {
  const chipsOf = (question: AssessmentDetail["questions"][number]) => [
    ...chapterLabels(question.learningObjectives, tree).map((label) => `Berdasarkan Materi ${label}`),
    ...question.learningObjectives.map((objective) => `Berdasarkan TP ${objective.number}`),
  ];

  return (
    <>
      <section className={cn(sectionClassName, "gap-6 print:hidden")}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">{assessment.title}</h3>
          <PrintButton disabled={assessment.questions.length === 0} />
        </div>

        {assessment.questions.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-[#c5c6cd] px-6 py-10 text-center text-sm text-[#45474c]">
            Belum ada soal di asesmen ini.
          </p>
        ) : (
          assessment.questions.map((question, index) => (
            <QuestionCard
              answer={question.answerKey}
              chips={chipsOf(question)}
              key={question.id}
              options={question.options}
              stem={question.stem}
              title={`Soal ${index + 1}`}
            />
          ))
        )}

        <Link className={cn(primaryButtonClassName, "gap-3 self-start")} href={`/${slug}/assessment?tab=daftar`}>
          <Image alt="" height={24} src="/assessment/arrow-left.svg" width={24} />
          Kembali ke Daftar Asesmen
        </Link>
      </section>

      {/* What "Unduh Soal" prints. */}
      <article className="hidden text-[12pt] leading-normal text-black print:block">
        <header className="mb-6 border-b border-black pb-3">
          <h1 className="text-[16pt] font-bold">{assessment.title}</h1>
          <p>
            {subject.name}, {subject.class.name}, {assessmentTypeLabels[assessment.type]},{" "}
            {assessmentModeLabels[assessment.mode]}
          </p>
          <p>
            Jadwal: {formatLongSchedule(assessment.opensAt)}
            {assessment.durationMinutes ? `, Durasi ${assessment.durationMinutes} menit` : ""}, KKM {assessment.kkm}
          </p>
        </header>
        <ol className="flex flex-col gap-5">
          {assessment.questions.map((question, index) => (
            <li className="break-inside-avoid" key={question.id}>
              <p className="whitespace-pre-line">
                <b>{index + 1}.</b> {question.stem}
              </p>
              {question.options ? (
                <ol className="mt-1 pl-6">
                  {question.options.map((option) => (
                    <li key={option.key}>
                      {option.key}. {option.text}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mt-2 h-24 border border-dashed border-gray-400" />
              )}
            </li>
          ))}
        </ol>
        <section className="mt-8 break-before-page">
          <h2 className="mb-3 text-[14pt] font-bold">Kunci Jawaban</h2>
          <ol className="flex flex-col gap-2">
            {assessment.questions.map((question, index) => (
              <li className="break-inside-avoid whitespace-pre-line" key={question.id}>
                <b>{index + 1}.</b> {question.answerKey}
                {question.learningObjectives.length > 0 && (
                  <span className="text-gray-600">
                    {" "}
                    (TP {question.learningObjectives.map((objective) => objective.number).join(", ")})
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>
      </article>
    </>
  );
}
