import type { CSSProperties } from "react";
import { cn } from "./cn";

// A Figma SVG drawn in the current text colour, so one file serves the active and inactive states of a menu item.
export function MaskIcon({ src, className }: { src: string; className?: string }) {
  const mask: CSSProperties = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  };

  return <span aria-hidden className={cn("inline-block shrink-0 bg-current", className)} style={mask} />;
}
