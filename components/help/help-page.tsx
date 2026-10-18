import Image from "next/image";
import { primaryButtonClassName } from "@/components/auth/styles";
import { cn } from "@/components/ui/cn";
import { faqs, SUPPORT_EMAIL, USER_GUIDE_URL } from "@/lib/help";

const cardClassName = "flex flex-col items-center gap-3 rounded-3xl bg-[#fafbfd] p-6 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)]";

function MailIcon() {
  return (
    <svg aria-hidden className="size-8" fill="none" stroke="#0058be" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

// Bantuan (SRS FR-X-030, FR-X-032; PRD Bagian 11; Figma New Design 187:10604): FAQ and the ways to reach the team.
export function HelpPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-16 px-4 py-10 sm:px-8">
      <section className="flex flex-col gap-6" id="faq">
        <div className="text-center leading-normal">
          <h2 className="text-3xl font-bold text-[#003d84] sm:text-[40px]">FAQs</h2>
          <p className="text-base text-[#75777d]">Frequently Asked Questions</p>
        </div>
        <div className="flex flex-col">
          {faqs.map((faq) => (
            <details className="group border-b border-[#99bce5]" key={faq.question}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-3 py-4 text-sm font-semibold text-[#1b1b1d] hover:text-[#0058be] [&::-webkit-details-marker]:hidden">
                {faq.question}
                <Image alt="" className="shrink-0 group-open:rotate-90" height={20} src="/assessment/chevron-right.svg" width={20} />
              </summary>
              <p className="px-3 pb-4 text-sm leading-relaxed text-[#45474c]">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <div className="text-center leading-normal">
          <h2 className="text-3xl font-bold text-[#003d84] sm:text-[40px]">Pusat Bantuan</h2>
          <p className="text-base text-[#75777d]">Apa yang bisa kami bantu?</p>
        </div>
        <div className="mx-auto grid w-full max-w-[700px] gap-4 sm:grid-cols-2">
          <div className={cardClassName}>
            <span className="grid size-12 place-items-center rounded-xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]">
              <MailIcon />
            </span>
            <h3 className="text-lg font-semibold text-[#1b1b1d]">Kirim Email ke Kami</h3>
            <p className="text-sm text-[#1b1b1d]">{SUPPORT_EMAIL}</p>
            <a className={cn(primaryButtonClassName, "mt-auto w-full py-2 text-sm")} href={`mailto:${SUPPORT_EMAIL}`}>
              Hubungi Email
            </a>
          </div>
          <div className={cardClassName}>
            <span className="grid size-12 place-items-center">
              <Image alt="" height={32} src="/materials/book.svg" width={32} />
            </span>
            <h3 className="text-lg font-semibold text-[#1b1b1d]">Panduan Pengguna</h3>
            <p className="text-sm text-[#1b1b1d]">Pahami cara menggunakan EduInsight</p>
            <a
              className={cn(primaryButtonClassName, "mt-auto w-full py-2 text-sm")}
              href={USER_GUIDE_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              Lihat Panduan Pengguna
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
