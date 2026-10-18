import Image from "next/image";
import Link from "next/link";

export type FooterLink = { label: string; href: string };

const teacherLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Support", href: "#" },
];

// The footer inside a subject workspace (Figma New Design 22:2816; the student one, 175:32037, has its own
// tagline and links).
export function WorkspaceFooter({
  tagline = "Systematic & Encouraging Learning.",
  links = teacherLinks,
}: {
  tagline?: string;
  links?: FooterLink[];
}) {
  return (
    <footer className="relative z-10 mt-auto flex flex-col gap-4 bg-[rgba(245,243,244,0.6)] px-4 py-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-16">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Image alt="" className="size-10" height={40} src="/auth/logo.svg" width={40} />
          <span className="text-xl font-semibold leading-normal text-[#1b1b1d]">EduInsight</span>
        </div>
        <p className="text-xs leading-normal text-[#45474c]">© 2026 EduInsight AI. {tagline}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-xs leading-normal text-[#45474c]">
        {links.map((link) => (
          <Link className="underline hover:text-[#1b1b1d]" href={link.href} key={link.label}>
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
