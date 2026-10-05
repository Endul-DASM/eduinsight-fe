import type { ReactNode } from "react";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full max-w-[542px] flex-col gap-6 rounded-xl border border-[#c5c6cd] bg-white p-6">
      {children}
    </div>
  );
}

// "Belum punya akun? Daftar sekarang" and the like, under the card.
export function AuthFootnote({ children }: { children: ReactNode }) {
  return <p className="text-center text-xs leading-4 tracking-[0.6px] text-[rgba(69,71,76,0.7)]">{children}</p>;
}
