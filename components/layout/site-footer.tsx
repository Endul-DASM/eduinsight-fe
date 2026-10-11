import Link from "next/link";

const footerLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Support", href: "#" },
];

// The footer of the pages outside a subject (Figma New Design 22:3060).
export function SiteFooter() {
  return (
    <footer className="relative z-10 flex flex-col items-center justify-center gap-3 px-4 py-6 text-xs leading-normal text-[#45474c] sm:flex-row sm:gap-6 sm:px-16">
      <p className="text-center">© 2024 EduInsight AI. Systematic &amp; Encouraging Learning.</p>
      <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
        {footerLinks.map((link) => (
          <Link className="underline hover:text-[#1b1b1d]" href={link.href} key={link.label}>
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
