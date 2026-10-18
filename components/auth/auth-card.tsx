import type { ReactNode } from "react";

// The glass card of the auth pages (Figma New Design 22:2919). Content is 443px wide on desktop.
export function AuthCard({ children }: { children: ReactNode }) {
  return (
    // On phones the content sits on the page background without the card (Figma New Design 22:3266).
    <div className="flex w-full max-w-[571px] flex-col gap-[35px] sm:rounded-3xl sm:bg-[rgba(245,243,244,0.6)] sm:px-16 sm:py-8 sm:shadow-[0_4px_20px_rgba(0,0,0,0.1)] sm:backdrop-blur-xs">
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
