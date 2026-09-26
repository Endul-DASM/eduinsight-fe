import Image from "next/image";
import Link from "next/link";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicTopNav } from "@/components/layout/public-top-nav";
import { ArrowRightIcon } from "@/components/ui/icons";
import type { Subject, Teacher } from "@/lib/api/types";
import { getSubjectPattern } from "@/lib/subject-patterns";

function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <Link
      className="group flex flex-col gap-4 overflow-hidden rounded-xl border border-[#c5c6cd] bg-white pb-4 shadow-[0_4px_4px_rgba(0,0,0,0.1)] transition-shadow hover:shadow-[0_10px_24px_-8px_rgba(8,90,192,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#085ac0]"
      href={`/${subject.slug}/dashboard`}
    >
      <div className="h-[98px] bg-[#ebe6db]">
        <Image
          alt=""
          className="size-full object-cover"
          height={98}
          src={getSubjectPattern(subject.slug)}
          width={214}
        />
      </div>
      <div className="flex items-center justify-between gap-2 px-3">
        <span className="text-base font-semibold leading-7 text-[#091426]">{subject.name}</span>
        <ArrowRightIcon className="size-5 shrink-0 text-[#091426] transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function SubjectSelectPage({ subjects, teacher }: { subjects: Subject[]; teacher: Teacher }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <PublicTopNav />
      <main className="relative flex flex-1 items-center overflow-hidden bg-[rgba(251,248,250,0.5)] px-4 py-16 sm:px-6 md:py-28 lg:px-10">
        <div className="absolute -left-48 -top-48 size-96 rounded-full bg-[rgba(216,226,255,0.3)] blur-[32px]" />
        <div className="absolute -bottom-20 -right-20 size-80 rounded-full bg-[rgba(216,226,252,0.2)] blur-[32px]" />
        <div className="relative mx-auto flex w-full max-w-[75rem] flex-col items-center gap-8">
          <div className="flex max-w-[32rem] flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-black sm:text-4xl">
              Selamat Datang, {teacher.name}
            </h1>
            <p className="text-sm text-[#45474c]">Silakan pilih mata pelajaran yang ingin dipantau.</p>
          </div>
          {subjects.length > 0 ? (
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5 lg:gap-8">
              {subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#45474c]">Belum ada mata pelajaran yang terdaftar.</p>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
