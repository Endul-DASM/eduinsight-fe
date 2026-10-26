import type { ReactNode } from "react";
import { Chip } from "./home-page";

// The frame of Ketentuan Layanan and Kebijakan Privasi, in the style of the public About page (Figma New Design
// 187:9563): a hero, a table of contents and one card per numbered article.

const cardClassName = "flex flex-col gap-4 rounded-3xl border border-[#c5c6cd] bg-white p-6 lg:p-8";

export type LegalArticle = { id: string; title: string; body: ReactNode };

// A bulleted list inside an article.
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5">
      {/* Fixed text in a fixed order, so the position is a stable key. */}
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export function LegalDocument({
  chip,
  title,
  lead,
  effectiveDate,
  articles,
}: {
  chip: string;
  title: string;
  lead: string;
  effectiveDate: string;
  articles: LegalArticle[];
}) {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-12 sm:px-8 lg:px-[120px] lg:py-20">
      <section className="flex flex-col items-start gap-4 leading-normal">
        <Chip icon="/landing/notebook-text.svg">{chip}</Chip>
        <h1 className="text-[32px] font-bold text-[#1b1b1d] lg:text-[40px]">{title}</h1>
        <p className="max-w-[760px] text-sm text-[#45474c] lg:text-base">{lead}</p>
        <p className="text-xs text-[#75777d]">Berlaku sejak {effectiveDate}</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
        <nav aria-label="Daftar isi" className={`${cardClassName} lg:sticky lg:top-24`}>
          <p className="text-base font-semibold text-[#1b1b1d]">Daftar Isi</p>
          <ol className="flex flex-col gap-2 text-sm leading-normal">
            {articles.map((article, index) => (
              <li key={article.id}>
                <a className="text-[#45474c] hover:text-[#0058be] hover:underline" href={`#${article.id}`}>
                  {index + 1}. {article.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex flex-col gap-6">
          {articles.map((article, index) => (
            <section className={`${cardClassName} scroll-mt-24`} id={article.id} key={article.id}>
              <h2 className="text-xl font-semibold leading-normal text-[#1b1b1d]">
                {index + 1}. {article.title}
              </h2>
              <div className="text-sm leading-relaxed text-[#45474c] lg:text-base">{article.body}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
