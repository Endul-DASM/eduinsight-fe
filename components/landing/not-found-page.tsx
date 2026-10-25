import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { LandingBackground, LandingFooter, poppins } from "./landing-shell";

// 404 (UAT baris 194; Figma New Design 265:9433): the public background and footer, "Oops!" and a way home. The texts
// are in Indonesian, like the rest of the app.
export function NotFoundPage({ homeHref }: { homeHref: string }) {
  return (
    <div className={cn(poppins.className, "relative flex min-h-screen flex-col overflow-x-clip bg-white text-[#003264]")}>
      <LandingBackground />
      <main className="relative flex flex-1 items-center justify-center px-4 py-16">
        <div className="flex w-full max-w-[611px] flex-col gap-3 text-center">
          <div className="flex flex-col gap-1 leading-normal">
            <p className="text-[96px] font-bold leading-[1.2] sm:text-[160px] lg:text-[200px] lg:leading-[1.5]">Oops!</p>
            <h1 className="text-2xl font-semibold sm:text-[32px]">404 - Halaman tidak ditemukan</h1>
            <p className="text-base">Halaman yang kamu cari tidak ada atau sudah dipindahkan.</p>
          </div>
          <Link
            className="flex h-12 items-center justify-center rounded-xl bg-[#0058be] px-4 text-base font-semibold text-[#f5f3f4] drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#004695] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0058be]"
            href={homeHref}
          >
            Kembali ke Halaman Utama
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
