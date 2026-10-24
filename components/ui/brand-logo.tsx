import Image from "next/image";
import { cn } from "./cn";

// The EduInsight logo (Figma New Design 265:9531): the "Ei" icon and the wordmark, "Edu" in blue. textClassName sets
// the wordmark size and can hide it, e.g. in the collapsed sidebar.
export function BrandLogo({ size = 40, textClassName }: { size?: number; textClassName?: string }) {
  return (
    <>
      <Image alt="" className="shrink-0" height={size} src="/brand/eduinsight-icon.png" style={{ width: size, height: size }} width={size} />
      <span className={cn("text-xl font-semibold leading-normal text-[#1b1b1d]", textClassName)}>
        <span className="text-[#004695]">Edu</span>Insight
      </span>
    </>
  );
}
