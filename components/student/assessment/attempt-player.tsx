"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { outlineButtonClassName, primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { MaskIcon } from "@/components/ui/mask-icon";
import { saveResponsesAction, submitAttemptAction } from "@/lib/actions/student-assessments";
import type { Attempt, AttemptQuestion } from "@/lib/api/student";
import { isChoiceType, questionTypeLabels } from "@/lib/assessment-form";
import { type AttemptSection, formatRemaining, isAnswered, sectionNames } from "@/lib/student-assessment";

type Answers = Record<string, string | null>;
type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; at: string } | { kind: "error"; message: string };

// FR-S-011: unsaved answers go out 2 s after the last change, and at least every 10 s.
const SAVE_DELAY_MS = 2_000;
const SAVE_MAX_MS = 10_000;

const timeFormat = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit" });

const card = "rounded-3xl bg-[#fafbfd] shadow-[0_8px_24px_rgba(0,0,0,0.08)]";

// "B" for PG, "Salah" for Benar/Salah.
function chosenLabel(question: AttemptQuestion, key: string | null | undefined): string {
  if (question.type !== "benar_salah") return key ?? "";
  return question.options?.find((option) => option.key === key)?.text ?? key ?? "";
}

// "Tandai Soal" is not stored by the backend; it stays in this browser per attempt.
function useFlags(attemptId: string) {
  const key = `attempt:${attemptId}:flags`;
  const [flags, setFlags] = useState<string[]>([]);
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the browser after hydration
      if (stored) setFlags(JSON.parse(stored) as string[]);
    } catch {
      // Storage may be unavailable (private mode); flags then last for the page only.
    }
  }, [key]);
  const toggle = useCallback(
    (questionId: string) =>
      setFlags((current) => {
        const next = current.includes(questionId) ? current.filter((id) => id !== questionId) : [...current, questionId];
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      }),
    [key],
  );
  return { flags, toggle };
}

// Pengerjaan Asesmen/Remedial and Konfirmasi Pengumpulan (PRD 6.2, SRS FR-S-010 – 013; Figma New Design 175:32740,
// 175:32988).
export function AttemptPlayer({
  slug,
  section = "assessment",
  subjectName,
  attempt,
  listHref,
}: {
  slug: string;
  section?: AttemptSection;
  subjectName: string;
  attempt: Attempt;
  listHref: string;
}) {
  const router = useRouter();
  const questions = attempt.questions;
  const [answers, setAnswers] = useState<Answers>(() =>
    Object.fromEntries(attempt.responses.map((response) => [response.questionId, response.answer])),
  );
  const dirty = useRef(new Map<string, string | null>());
  const [dirtyCount, setDirtyCount] = useState(0);
  const [index, setIndex] = useState(() => {
    const firstOpen = questions.findIndex((question) => !isAnswered(attempt.responses.find((r) => r.questionId === question.id)?.answer));
    return firstOpen < 0 ? 0 : firstOpen;
  });
  const [phase, setPhase] = useState<"soal" | "konfirmasi">("soal");
  const [save, setSave] = useState<SaveState>({ kind: "idle" });
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, startSubmit] = useTransition();
  const { flags, toggle } = useFlags(attempt.id);

  // The timer runs on server time: the offset between the server and this device at load.
  const [offset] = useState(() => new Date(attempt.serverNow).getTime() - Date.now());
  const [deadline, setDeadline] = useState(() => new Date(attempt.deadlineAt).getTime());
  const [now, setNow] = useState(() => Date.now() + offset);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() + offset), 1000);
    return () => clearInterval(timer);
  }, [offset]);
  const remaining = deadline - now;

  const flushing = useRef<Promise<boolean> | null>(null);
  const flush = useCallback(async (): Promise<boolean> => {
    if (flushing.current) await flushing.current;
    if (dirty.current.size === 0) return true;
    const batch = new Map(dirty.current);
    const run = (async () => {
      setSave({ kind: "saving" });
      const result = await saveResponsesAction(
        attempt.id,
        [...batch].map(([questionId, answer]) => ({ questionId, answer })),
      );
      if (result.ok) {
        // Drop what was sent, unless it changed again meanwhile.
        for (const [id, value] of batch) if (dirty.current.get(id) === value) dirty.current.delete(id);
        setDirtyCount(dirty.current.size);
        setDeadline(new Date(result.deadlineAt).getTime());
        setSave({ kind: "saved", at: result.savedAt });
        return true;
      }
      if (result.submitted) {
        router.replace(`/student/${slug}/${section}/${attempt.assessmentId}/selesai?attempt=${attempt.id}`);
        return false;
      }
      setSave({ kind: "error", message: result.message });
      return false;
    })();
    flushing.current = run;
    try {
      return await run;
    } finally {
      flushing.current = null;
    }
  }, [attempt.assessmentId, attempt.id, router, section, slug]);

  // Debounced save after a change, plus the 10 s ceiling.
  useEffect(() => {
    if (dirtyCount === 0) return;
    const quiet = setTimeout(() => void flush(), SAVE_DELAY_MS);
    const ceiling = setTimeout(() => void flush(), SAVE_MAX_MS);
    return () => {
      clearTimeout(quiet);
      clearTimeout(ceiling);
    };
  }, [dirtyCount, answers, flush]);

  // Back online: send what is still pending.
  useEffect(() => {
    const online = () => void flush();
    window.addEventListener("online", online);
    return () => window.removeEventListener("online", online);
  }, [flush]);

  // Warn before leaving with unsaved answers.
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty.current.size > 0) event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, []);

  const submit = useCallback(() => {
    setSubmitError(undefined);
    startSubmit(async () => {
      await flush();
      const result = await submitAttemptAction(slug, attempt.assessmentId, attempt.id, section);
      if (result) setSubmitError(result.message);
    });
  }, [attempt.assessmentId, attempt.id, flush, section, slug]);

  // FR-S-012: hand in automatically when the time is up.
  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (remaining <= 0 && !autoSubmitted.current) {
      autoSubmitted.current = true;
      submit();
    }
  }, [remaining, submit]);

  function answer(questionId: string, value: string | null) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    dirty.current.set(questionId, value);
    setDirtyCount(dirty.current.size);
  }

  const answeredCount = useMemo(() => questions.filter((question) => isAnswered(answers[question.id])).length, [answers, questions]);
  const question = questions[index];
  const progress = questions.length ? (phase === "konfirmasi" ? 100 : ((index + 1) / questions.length) * 100) : 0;
  const unanswered = questions.length - answeredCount;
  const timeUp = remaining <= 0;

  const saveText =
    save.kind === "saving"
      ? "Menyimpan..."
      : save.kind === "saved"
        ? `Tersimpan ${timeFormat.format(new Date(save.at))}`
        : save.kind === "error"
          ? `Gagal menyimpan: ${save.message} Mencoba lagi...`
          : dirtyCount > 0
            ? "Ada jawaban yang belum tersimpan"
            : "Jawaban tersimpan otomatis";

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
      <section className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-[#e6eff9] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="flex min-w-0 flex-1 flex-col gap-2 leading-normal">
          <h2 className="text-2xl font-semibold text-[#003264]">{attempt.assessmentTitle}</h2>
          <p className="text-base text-[#45474c]">
            {phase === "konfirmasi"
              ? "Konfirmasi Pengumpulan"
              : `Soal ${index + 1} dari ${questions.length}, ${answeredCount} soal sudah dijawab`}
          </p>
          <span className="h-2 w-full max-w-[520px] rounded-full bg-white/70">
            <span className="block h-full rounded-full bg-[#0058be] transition-[width]" style={{ width: `${progress}%` }} />
          </span>
          <p aria-live="polite" className={cn("text-xs", save.kind === "error" ? "text-[#b91c1c]" : "text-[#45474c]")}>
            {saveText}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="leading-normal">
            <p className="text-xs text-[#45474c]">WAKTU TERSISA</p>
            <p className={cn("text-2xl font-bold tabular-nums", remaining < 60_000 ? "text-[#dc2626]" : "text-[#003264]")} role="timer">
              {formatRemaining(remaining)}
            </p>
          </div>
          <button
            className={cn(outlineButtonClassName, "px-4 py-2")}
            disabled={submitting}
            onClick={async () => {
              if (await flush()) router.push(listHref);
            }}
            type="button"
          >
            Simpan &amp; Keluar
          </button>
        </div>
      </section>

      {phase === "konfirmasi" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className={cn(card, "flex flex-col items-center justify-center gap-6 p-8 text-center")}>
            <span className="grid size-32 place-items-center rounded-full bg-[#e6eff9]">
              <Image alt="" height={56} src="/assessment/brain.svg" width={56} />
            </span>
            <p className="text-[32px] font-bold text-[#0058be]">Hebat Sekali!</p>
            <p className="max-w-[480px] text-base leading-normal text-[#45474c]">
              Kamu hampir menyelesaikan langkah penting untuk memahami kemajuan belajarmu. Sedikit lagi menuju wawasan yang berharga!
            </p>
          </section>
          <section className={cn(card, "flex flex-col gap-5 p-6")}>
            <div className="leading-normal">
              <h3 className="text-2xl font-semibold text-[#1b1b1d]">Yakin ingin mengakhiri {sectionNames[section].noun}?</h3>
              <p className="text-base text-[#45474c]">Periksa kembali ringkasan pengerjaanmu di bawah ini.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={cn(card, "p-5")}>
                <p className="text-base text-[#45474c]">Terjawab</p>
                <p className="text-[32px] font-bold text-[#1b1b1d]">
                  {answeredCount}/{questions.length}
                </p>
              </div>
              <div className={cn(card, "p-5")}>
                <p className="text-base text-[#45474c]">Ditandai</p>
                <p className="text-[32px] font-bold text-[#1b1b1d]">{flags.length}</p>
              </div>
            </div>
            {(unanswered > 0 || flags.length > 0) && (
              <div className="flex flex-col gap-2">
                {unanswered > 0 && (
                  <span className="self-start rounded-3xl bg-[#ffedd5] px-2 py-0.5 text-xs font-semibold text-[#9a3412]">
                    {unanswered} soal belum dijawab
                  </span>
                )}
                <p className="text-xs text-[#45474c]">
                  {unanswered > 0 && `Masih ada ${unanswered} soal kosong. `}
                  {flags.length > 0 && `Ada ${flags.length} soal yang kamu tandai. `}
                  Kamu dapat memeriksanya kembali sebelum mengumpulkan.
                </p>
              </div>
            )}
            <div className="rounded-2xl bg-[#e6eff9] p-4 leading-normal">
              <p className="text-xs text-[#45474c]">WAKTU TERSISA</p>
              <p className="text-2xl font-bold tabular-nums text-[#003264]">{formatRemaining(remaining)}</p>
            </div>
            {submitError && (
              <p className="rounded-lg bg-[#ffdad6] px-4 py-3 text-sm text-[#93000a]" role="alert">
                {submitError}
              </p>
            )}
            <button className={cn(primaryButtonClassName, "w-full")} disabled={submitting} onClick={submit} type="button">
              {submitting ? "Mengumpulkan..." : "Kumpulkan Sekarang"}
            </button>
            <button
              className={cn(outlineButtonClassName, "w-full")}
              disabled={submitting || timeUp}
              onClick={() => setPhase("soal")}
              type="button"
            >
              <MaskIcon className="size-5.5" src="/assessment/arrow-left.svg" />
              Kembali ke Soal
            </button>
          </section>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-6">
            {question && (
              <section className={cn(card, "flex flex-col gap-5 p-6")}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <span className="rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-0.5 text-xs font-semibold text-[#004695]">
                    {subjectName}, {questionTypeLabels[question.type]}
                  </span>
                  <button
                    aria-pressed={flags.includes(question.id)}
                    className={cn(
                      outlineButtonClassName,
                      "px-4 py-2",
                      flags.includes(question.id) && "border-[#dc2626] text-[#dc2626] hover:bg-[#fef2f2]",
                    )}
                    onClick={() => toggle(question.id)}
                    type="button"
                  >
                    {flags.includes(question.id) ? "Batal Tandai" : "Tandai Soal"}
                  </button>
                </div>
                <h3 className="text-2xl font-semibold text-[#1b1b1d]">Soal {question.number}</h3>
                <p className="whitespace-pre-line text-lg leading-normal text-[#1b1b1d]">{question.stem}</p>
                {isChoiceType(question.type) && question.options ? (
                  <div className="flex flex-col gap-3" role="radiogroup">
                    {question.options.map((option) => {
                      const selected = answers[question.id] === option.key;
                      return (
                        <button
                          aria-checked={selected}
                          className={cn(
                            "flex items-center gap-4 rounded-xl border px-4 py-3 text-left text-base transition-colors",
                            selected ? "border-[#0058be] bg-[#e6eff9]" : "border-[#c5c6cd] bg-[#fbf8fa] hover:border-[#0058be]",
                          )}
                          key={option.key}
                          onClick={() => answer(question.id, selected ? null : option.key)}
                          role="radio"
                          type="button"
                        >
                          <span
                            className={cn(
                              "grid size-6 shrink-0 place-items-center rounded-md border-2",
                              selected ? "border-[#0058be] bg-[#0058be] text-white" : "border-[#0058be]",
                            )}
                          >
                            {selected && "✓"}
                          </span>
                          {/* Benar/Salah reads better without the option letters. */}
                          <span>{question.type === "benar_salah" ? option.text : `${option.key}. ${option.text}`}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    aria-label={`Jawaban soal ${question.number}`}
                    className="min-h-[180px] rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] p-4 text-base outline-none focus:border-[#0058be]"
                    maxLength={10000}
                    onChange={(event) => answer(question.id, event.target.value || null)}
                    placeholder="Tulis jawabanmu di sini..."
                    value={answers[question.id] ?? ""}
                  />
                )}
                <p className="text-xs text-[#45474c]">
                  {isAnswered(answers[question.id])
                    ? isChoiceType(question.type)
                      ? `Jawabanmu: ${chosenLabel(question, answers[question.id])}. Klik lagi untuk membatalkan.`
                      : "Jawaban tersimpan otomatis saat kamu mengetik."
                    : "Belum memilih jawaban untuk soal ini."}
                </p>
              </section>
            )}
            <div className="flex justify-between gap-4">
              <button
                className={cn(outlineButtonClassName, "px-4 py-2")}
                disabled={index === 0}
                onClick={() => setIndex((value) => Math.max(0, value - 1))}
                type="button"
              >
                ← Sebelumnya
              </button>
              {index < questions.length - 1 ? (
                <button className={cn(primaryButtonClassName, "px-4 py-2")} onClick={() => setIndex((value) => value + 1)} type="button">
                  Selanjutnya →
                </button>
              ) : (
                <button className={cn(primaryButtonClassName, "px-4 py-2")} onClick={() => setPhase("konfirmasi")} type="button">
                  Selesaikan →
                </button>
              )}
            </div>
          </div>

          <aside className={cn(card, "flex h-fit flex-col gap-4 p-6")}>
            <h3 className="text-2xl font-semibold text-[#1b1b1d]">Navigasi Soal</h3>
            <p className="text-xs text-[#45474c]">Klik nomor untuk melompat ke soal tertentu.</p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-3xl bg-[rgba(153,188,229,0.6)] px-2 py-0.5 text-xs font-semibold text-[#004695]">
                {answeredCount} dijawab
              </span>
              <span className="rounded-3xl bg-[#ffedd5] px-2 py-0.5 text-xs font-semibold text-[#9a3412]">{unanswered} belum</span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {questions.map((item, i) => {
                const done = isAnswered(answers[item.id]);
                const current = i === index;
                return (
                  <button
                    aria-current={current ? "step" : undefined}
                    aria-label={`Soal ${item.number}${done ? ", dijawab" : ""}${flags.includes(item.id) ? ", ditandai" : ""}`}
                    className={cn(
                      "relative grid aspect-square place-items-center rounded-xl border text-base font-semibold",
                      done ? "border-[#0058be] bg-[#0058be] text-white" : "border-[#c5c6cd] bg-white text-[#003264]",
                      current && "ring-2 ring-[#0058be] ring-offset-2",
                    )}
                    key={item.id}
                    onClick={() => setIndex(i)}
                    type="button"
                  >
                    {item.number}
                    {flags.includes(item.id) && <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#dc2626]" />}
                  </button>
                );
              })}
            </div>
            <ul className="flex flex-col gap-2 border-t border-[#eae7e9] pt-4 text-xs text-[#45474c]">
              <li className="flex items-center gap-2">
                <span className="size-3 rounded-sm bg-[#0058be]" /> Biru: sudah dijawab
              </li>
              <li className="flex items-center gap-2">
                <span className="size-3 rounded-sm ring-2 ring-[#0058be]" /> Bingkai biru: sedang dikerjakan
              </li>
              <li className="flex items-center gap-2">
                <span className="size-3 rounded-sm border border-[#c5c6cd] bg-white" /> Putih: belum dijawab
              </li>
              <li className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-[#dc2626]" /> Titik merah: ditandai (ragu-ragu)
              </li>
            </ul>
            <button className={cn(primaryButtonClassName, "w-full")} onClick={() => setPhase("konfirmasi")} type="button">
              Selesaikan Ujian
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
