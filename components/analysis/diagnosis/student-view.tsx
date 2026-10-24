import Image from "next/image";
import Link from "next/link";
import { primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import type { ClassDiagnosis, DiagnosisItem, StudentDiagnosis } from "@/lib/api/diagnosis";
import type { AssessmentDetail } from "@/lib/api/types";
import { questionTypeLabels } from "@/lib/assessment-form";
import { formatPercent, formatScore } from "@/lib/assessment-results";
import { initialsOf, labelChip, patternTitle, toLabel } from "@/lib/diagnosis";
import { diagnosisHref, type DiagnosisParams } from "./links";
import { StudentPicker } from "./student-picker";

const card = "flex flex-col gap-4 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";

function LabelChip({ label }: { label: ReturnType<typeof toLabel> }) {
  return label ? (
    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-semibold", labelChip[label])}>{label}</span>
  ) : (
    <span className="text-[#9aa1ae]">–</span>
  );
}

const itemKey = (item: DiagnosisItem) => `${item.assessmentId}:${item.questionId}`;

// Detail Soal (Figma New Design 85:7990): the source question with the key and the student's answer, the score,
// and the misconception pattern the answer belongs to. The concept explanation and illustration need the backend.
function QuestionDetail({
  slug,
  params,
  diagnosis,
  student,
  item,
  objectiveNumber,
  objectiveId,
  assessment,
}: {
  slug: string;
  params: DiagnosisParams;
  diagnosis: ClassDiagnosis;
  student: StudentDiagnosis;
  item: DiagnosisItem;
  objectiveNumber: string;
  objectiveId: string;
  assessment: AssessmentDetail | null;
}) {
  const question = assessment?.questions.find((entry) => entry.id === item.questionId);
  const pattern = diagnosis.misconceptions.find((entry) =>
    entry.sources.some((source) => source.questionId === item.questionId && (source.option === null || source.option === item.answer)) &&
    entry.studentIds.includes(student.student.id),
  );
  const backHref = diagnosisHref(slug, params, { item: undefined, tp: objectiveId });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Detail Soal No. {item.number}</h3>
        <Link className={cn(primaryButtonClassName, "gap-2 px-4 py-2 text-sm")} href={backHref}>
          <Image alt="" height={20} src="/assessment/arrow-left.svg" width={20} />
          Kembali
        </Link>
      </div>

      <section className={card}>
        <h4 className="text-base font-semibold text-[#1b1b1d]">Soal sumber</h4>
        <p className="text-sm text-[#0058be]">
          TP {objectiveNumber}, {questionTypeLabels[question?.type ?? "pg"].toLowerCase()}, {item.assessmentTitle}
        </p>
        {!question ? (
          <p className="text-sm text-[#45474c]">Naskah soal tidak dapat dimuat.</p>
        ) : (
          <>
            <p className="whitespace-pre-line text-base font-semibold leading-normal text-[#1b1b1d]">{question.stem}</p>
            {question.options ? (
              <ul className="flex flex-col gap-2">
                {question.options.map((option) => {
                  const isKey = option.key === question.answerKey;
                  const picked = option.key === item.answer;
                  return (
                    <li
                      className={cn(
                        "flex items-center gap-4 rounded-xl border px-4 py-3 text-sm",
                        isKey ? "border-[#16a34a] bg-[#f0fdf4]" : picked ? "border-[#dc2626] bg-[#fef2f2]" : "border-[#c5c6cd] bg-white",
                      )}
                      key={option.key}
                    >
                      <span className="font-semibold">{option.key}</span>
                      <span className="flex-1">{option.text}</span>
                      {isKey && <span className="text-xs font-semibold text-[#16a34a]">Jawaban benar</span>}
                      {picked && !isKey && (
                        <span className="text-xs font-semibold text-[#dc2626]">Jawaban {student.student.name} (salah)</span>
                      )}
                      {picked && isKey && <span className="text-xs font-semibold text-[#16a34a]">(dipilih {student.student.name})</span>}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-[#c5c6cd] bg-white p-4 text-sm">
                  <p className="text-xs font-semibold text-[#45474c]">Jawaban {student.student.name}</p>
                  <p className="whitespace-pre-line">{item.answer ?? "Tidak dijawab"}</p>
                </div>
                <div className="rounded-xl border border-[#16a34a] bg-[#f0fdf4] p-4 text-sm">
                  <p className="text-xs font-semibold text-[#16a34a]">Kunci jawaban / rubrik</p>
                  <p className="whitespace-pre-line">{question.answerKey}</p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className={card}>
          <h4 className="text-base font-semibold text-[#1b1b1d]">Relasi dengan akar masalah</h4>
          {pattern ? (
            <>
              <p className="flex flex-wrap justify-between gap-2 text-sm font-semibold text-[#0058be]">
                Pola #{pattern.rank}: {patternTitle(pattern)}
                <span className="text-xs text-[#1b1b1d]">
                  {pattern.affectedCount} siswa ({formatPercent(pattern.affectedPct)})
                </span>
              </p>
              <p className="text-sm text-[#45474c]">
                Narasi AI segera tersedia. Jawaban ini adalah bukti pola, bukan kepastian penyebab konseptual; perlu validasi guru.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  className="rounded-xl border-2 border-[#0058be] px-4 py-2 text-sm font-semibold text-[#0058be] hover:bg-[#e6eff9]"
                  href={diagnosisHref(slug, params, { view: "tp", tp: objectiveId, item: undefined })}
                >
                  Lihat {pattern.affectedCount} siswa terdampak
                </Link>
                <Link
                  className="rounded-xl border-2 border-[#0058be] px-4 py-2 text-sm font-semibold text-[#0058be] hover:bg-[#e6eff9]"
                  href={backHref}
                >
                  Kembali ke TP {objectiveNumber}
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#45474c]">
              {item.isCorrect ? "Jawaban benar; tidak termasuk pola kesalahan." : "Jawaban ini belum termasuk pola miskonsepsi yang terdeteksi."}
            </p>
          )}
        </section>
        <section className={card}>
          <h4 className="text-base font-semibold text-[#1b1b1d]">Bukti skor</h4>
          <p className={cn("text-3xl font-bold", item.isCorrect ? "text-[#16a34a]" : "text-[#dc2626]")}>{formatScore(item.score)} / 100</p>
          <p className="text-xs text-[#45474c]">
            Jawaban siswa: {item.answer ?? "–"}
            {question?.options && `, kunci: ${question.answerKey}`}
            {item.misconceptionTag && `, tag: ${item.misconceptionTag}`}
          </p>
        </section>
      </div>
    </div>
  );
}

// Diagnosis Siswa (FR-G-082, FR-G-085; Figma New Design 85:7350, 85:7990): one student against the class, down to
// the answers behind each TP score.
export function StudentView({
  slug,
  params,
  className,
  diagnosis,
  student,
  itemAssessment,
}: {
  slug: string;
  params: DiagnosisParams;
  className: string;
  diagnosis: ClassDiagnosis;
  student: StudentDiagnosis | null;
  // The assessment of the question opened in Detail Soal, if any.
  itemAssessment: AssessmentDetail | null;
}) {
  const students = diagnosis.students
    .map((row) => ({ id: row.student.id, name: row.student.name }))
    .sort((a, b) => a.name.localeCompare(b.name, "id"));

  if (!student) {
    return (
      <div className="flex flex-col gap-6">
        <StudentPicker params={params} slug={slug} students={students} />
        <p className="px-2 text-sm text-[#45474c]">Belum ada siswa dipilih.</p>
      </div>
    );
  }

  const objectives = student.learningObjectives;
  const scored = objectives.filter((objective) => objective.score !== null);
  const average = scored.length ? scored.reduce((sum, objective) => sum + objective.score!, 0) / scored.length : null;
  const items = [...new Map(objectives.flatMap((objective) => objective.items).map((item) => [itemKey(item), item])).values()];
  const correct = items.filter((item) => item.isCorrect).length;
  const selected =
    objectives.find((objective) => objective.learningObjective.id === params.tp) ??
    objectives.find((objective) => objective.learningObjective.id === student.weakest) ??
    objectives[0];
  const openItem = params.item ? selected?.items.find((item) => itemKey(item) === params.item) : undefined;
  const patterns = diagnosis.misconceptions.filter((pattern) => pattern.studentIds.includes(student.student.id));

  return (
    <div className="flex flex-col gap-6">
      <StudentPicker params={params} slug={slug} students={students} />

      <section className="flex flex-wrap items-center gap-6 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
        <span className="grid size-14 place-items-center rounded-full bg-[#e6eff9] text-xl font-bold text-[#0058be]">
          {initialsOf(student.student.name)}
        </span>
        <div className="leading-normal">
          <p className="text-xl font-bold text-[#1b1b1d]">{student.student.name}</p>
          <p className="text-xs text-[#45474c]">
            {className}
            {student.student.nis && `, NIS ${student.student.nis}`}, {student.assessments.length} asesmen dalam cakupan
          </p>
        </div>
        <div className="leading-normal">
          <p className="text-[28px] font-bold text-[#0058be]">{formatPercent(average)}</p>
          <p className="text-xs text-[#45474c]">
            {correct} / {items.length} butir benar
          </p>
        </div>
      </section>

      {student.aiNarrative && student.aiNarrative.items.length > 0 && (
        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-base font-semibold text-[#1b1b1d]">Penjelasan AI yang dilihat siswa</h4>
            <span className="text-xs text-[#75777d]">
              Dibuat {new Date(student.aiNarrative.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })} dari
              jawaban siswa ini
            </span>
          </div>
          <ul className="flex flex-col gap-3 text-sm leading-normal text-[#45474c]">
            {student.aiNarrative.items.map((item) => {
              const objective = student.learningObjectives.find((o) => o.learningObjective.id === item.learningObjectiveId);
              return (
                <li key={item.learningObjectiveId}>
                  <p className="font-semibold text-[#1b1b1d]">
                    {objective ? `TP ${objective.learningObjective.number} ${objective.learningObjective.description}` : "TP"}
                  </p>
                  <p>{item.explanation}</p>
                  <p className="text-[#004695]">Tips: {item.tip}</p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {openItem && selected ? (
        <QuestionDetail
          assessment={itemAssessment}
          diagnosis={diagnosis}
          item={openItem}
          objectiveId={selected.learningObjective.id}
          objectiveNumber={selected.learningObjective.number}
          params={params}
          slug={slug}
          student={student}
        />
      ) : (
        <>
          <section className={card}>
            <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Ketercapaian siswa dibanding kelas</h3>
            <div className="flex gap-4 text-xs text-[#45474c]">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-[#0058be]" /> {student.student.name}
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-sm bg-[#99bce5]" /> Rata-rata kelas (skala 0–100)
              </span>
            </div>
            <ul className="flex flex-col gap-4">
              {objectives.map((objective) => (
                <li className="grid items-center gap-2 sm:grid-cols-[220px_minmax(0,1fr)_60px]" key={objective.learningObjective.id}>
                  <div className="leading-normal">
                    <p className="text-sm font-semibold text-[#1b1b1d]">TP {objective.learningObjective.number}</p>
                    <p className="line-clamp-1 text-xs text-[#45474c]" title={objective.learningObjective.description}>
                      {objective.learningObjective.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { value: objective.score, tone: "bg-[#0058be]" },
                      { value: objective.classAverage, tone: "bg-[#99bce5]" },
                    ].map((bar, index) => (
                      <div className="flex items-center gap-2" key={index}>
                        <span className="h-2 flex-1 rounded-full bg-[#eef1f5]">
                          <span className={cn("block h-full rounded-full", bar.tone)} style={{ width: `${bar.value ?? 0}%` }} />
                        </span>
                        <span className="w-12 text-right text-[10px] text-[#0058be]">{formatPercent(bar.value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="justify-self-end">
                    <LabelChip label={toLabel(objective.label)} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={card}>
            <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">Rincian numerik per TP</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left text-xs leading-normal">
                <thead className="bg-[#f5f3f4] text-[#45474c]">
                  <tr>
                    {["Tujuan pembelajaran", "Siswa", "Kelas", "Selisih (poin)", "Label", "Bukti soal"].map((head) => (
                      <th className="px-3 py-2.5 font-semibold" key={head}>
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {objectives.map((objective) => {
                    const gap =
                      objective.score !== null && objective.classAverage !== null ? objective.score - objective.classAverage : null;
                    const active = objective.learningObjective.id === selected?.learningObjective.id;
                    return (
                      <tr className={active ? "bg-[#e6eff9]" : undefined} key={objective.learningObjective.id}>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5">
                          <Link
                            className="text-[#0058be] hover:underline"
                            href={diagnosisHref(slug, params, { tp: objective.learningObjective.id, item: undefined })}
                            scroll={false}
                          >
                            TP {objective.learningObjective.number}: {objective.learningObjective.description} →
                          </Link>
                          {objective.limitedData && <span className="ml-2 text-[10px] text-[#c2410c]">data terbatas</span>}
                        </td>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5 font-semibold">{formatPercent(objective.score)}</td>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5">{formatPercent(objective.classAverage)}</td>
                        <td className={cn("border-b border-[#eae7e9] px-3 py-2.5", gap !== null && gap < 0 ? "text-[#dc2626]" : "text-[#16a34a]")}>
                          {gap === null ? "–" : `${gap > 0 ? "+" : ""}${formatScore(gap)}`}
                        </td>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5">
                          <LabelChip label={toLabel(objective.label)} />
                        </td>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5 text-[#0058be]">
                          {objective.items.map((item) => item.number).join(", ") || "–"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#75777d]">
              Selisih = skor siswa − rata-rata kelas (poin persentase).
            </p>
          </section>

          {selected && (
            <section className={card}>
              <h3 className="text-xl font-semibold leading-normal text-[#1b1b1d]">
                Bukti jawaban TP {selected.learningObjective.number}
              </h3>
              <p className="text-base text-[#1b1b1d]">
                {formatPercent(selected.score)}, {selected.items.filter((item) => item.isCorrect).length} dari {selected.items.length} butir
                benar, label {toLabel(selected.label) ?? "–"}
              </p>
              <p className="text-xs text-[#45474c]">Klik butir untuk melihat soal, jawaban siswa, dan kunci.</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left text-xs leading-normal">
                  <thead className="bg-[#f5f3f4] text-[#45474c]">
                    <tr>
                      {["Butir", "Asesmen", "Jawaban", "Hasil", "Skor", "Tag miskonsepsi"].map((head) => (
                        <th className="px-3 py-2.5 font-semibold" key={head}>
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selected.items.map((item) => (
                      <tr key={itemKey(item)}>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5">
                          <Link
                            className="font-semibold text-[#0058be] hover:underline"
                            href={diagnosisHref(slug, params, { tp: selected.learningObjective.id, item: itemKey(item) })}
                          >
                            {String(item.number).padStart(2, "0")} →
                          </Link>
                        </td>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5 text-[#45474c]">{item.assessmentTitle}</td>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5">{item.answer ?? "–"}</td>
                        <td className={cn("border-b border-[#eae7e9] px-3 py-2.5", item.isCorrect ? "text-[#16a34a]" : "text-[#dc2626]")}>
                          {item.isCorrect === null ? "Uraian" : item.isCorrect ? "Benar" : "Salah"}
                        </td>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5">{formatScore(item.score)}</td>
                        <td className="border-b border-[#eae7e9] px-3 py-2.5 text-[#45474c]">{item.misconceptionTag ?? "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {patterns.map((pattern) => (
                <div className="rounded-xl bg-[#e6eff9] px-4 py-3 text-xs leading-normal text-[#45474c]" key={pattern.rank}>
                  <p className="text-sm font-semibold text-[#0058be]">
                    Terlibat pola #{pattern.rank} bersama {pattern.affectedCount - 1} siswa lainnya
                  </p>
                  {patternTitle(pattern)} ({pattern.sources.map((source) => `butir ${source.number}${source.option ? ` opsi ${source.option}` : ""}`).join(", ")}).
                  Indikasi perlu divalidasi guru.
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
