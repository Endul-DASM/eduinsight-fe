import Link from "next/link";
import { HelpIcon } from "@/components/ui/icons";

const navLinks = [
  { label: "Fitur", href: "#" },
  { label: "Tentang Kami", href: "#" },
];

export function PublicTopNav() {
  return (
    <header className="flex items-center justify-between gap-4 bg-[rgba(251,248,250,0.8)] px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-[6px] sm:px-6 lg:px-10">
      <Link className="text-xl font-semibold tracking-[-0.02em] text-black sm:text-2xl" href="/">
        EduInsight
      </Link>
      <div className="flex items-center gap-4 sm:gap-6">
        <nav className="hidden items-center gap-8 sm:flex">
          {navLinks.map((link) => (
            <Link className="text-sm text-[#45474c]" href={link.href} key={link.label}>
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="grid size-8 place-items-center rounded-full text-[#085ac0]">
          <HelpIcon className="size-5" />
        </span>
      </div>
    </header>
  );
}
