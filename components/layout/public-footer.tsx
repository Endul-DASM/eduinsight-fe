import Link from "next/link";

const footerLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Support", href: "#" },
];

export function PublicFooter() {
  return (
    <footer className="flex flex-col items-center gap-4 bg-[#f6f3f5] px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
      <div className="flex flex-col items-center gap-2 sm:items-start">
        <p className="text-xl font-black text-black">EduInsight</p>
        <p className="text-xs font-semibold tracking-[0.05em] text-[#45474c] opacity-90">
          © 2026 EduInsight AI. Systematic &amp; Encouraging Learning.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {footerLinks.map((link) => (
          <Link
            className="text-xs font-semibold tracking-[0.05em] text-[rgba(69,71,76,0.7)] underline"
            href={link.href}
            key={link.label}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </footer>
  );
}
