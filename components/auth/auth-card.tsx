import type { ReactNode } from "react";

// The glass card of the auth pages (Figma New Design 22:2919). Content is 443px wide on desktop.
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full max-w-[571px] flex-col gap-[35px] rounded-3xl bg-[rgba(245,243,244,0.6)] px-6 py-8 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs sm:px-16">
      {children}
    </div>
  );
}

// "Belum punya akun? Daftar sekarang" and the like, inside the card.
export function AuthFootnote({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-normal text-[#1b1b1d]">{children}</p>;
}

// The line between a form and the Google button.
export function AuthDivider() {
  return (
    <div className="flex items-center gap-3 text-xs text-[#75777d]">
      <span className="h-px flex-1 bg-[#c5c6cd]" />
      <span>atau</span>
      <span className="h-px flex-1 bg-[#c5c6cd]" />
    </div>
  );
}
