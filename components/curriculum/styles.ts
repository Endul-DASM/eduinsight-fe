import { buttonBaseClassName } from "@/components/auth/styles";

// Glass card of the workspace (Figma New Design 54:6923).
export const sectionClassName = "flex w-full flex-col gap-5 rounded-3xl bg-[#fafbfd] p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)]";

// The Bab form and other wide modals (Figma New Design 50:3662, 861px wide).
export const wideModalClassName =
  "max-w-[861px] rounded-3xl border border-[#c5c6cd] bg-white/90 p-6 shadow-[0_4px_20px_rgba(0,0,0,0.1)] backdrop-blur-xs backdrop:bg-[rgba(9,20,38,0.2)] backdrop:backdrop-blur-sm";

// "Simpan Draft" (the Disabled variant of the design's button, which is still clickable).
export const greyButtonClassName = `${buttonBaseClassName} bg-[#c5c6cd] text-[#45474c] hover:bg-[#b5b7bf]`;

// The light blue button of the design (Ghost), e.g. "Tidak" and "Tambah CP Sendiri".
export const ghostButtonClassName = `${buttonBaseClassName} bg-[rgba(153,188,229,0.6)] text-[#004695] shadow-[0_4px_8px_rgba(0,0,0,0.15)] drop-shadow-none hover:bg-[rgba(153,188,229,0.85)]`;

export const redButtonClassName = `${buttonBaseClassName} bg-[#dc2626] text-[#f5f3f4] hover:bg-[#b91c1c]`;

export const redOutlineButtonClassName = `${buttonBaseClassName} border-2 border-[#dc2626] bg-[#f5f3f4] py-2.5 text-[#dc2626] hover:bg-[#fee2e2]`;

// Small icon buttons on cards (pencil, ×, trash).
export const iconButtonClassName =
  "grid size-7 place-items-center rounded-md transition-colors hover:bg-[rgba(0,88,190,0.08)] focus-visible:outline-2 focus-visible:outline-[#0058be]";

// The round + button at the bottom right of a section (Figma New Design 61:6053).
export const addButtonClassName =
  "grid place-items-center rounded-xl bg-[rgba(153,188,229,0.6)] px-6 py-[18px] transition-colors hover:bg-[rgba(153,188,229,0.85)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0058be]";

export const fieldLabelClassName = "text-xs font-semibold leading-normal text-[#1b1b1d]";

export const inputBoxClassName =
  "w-full rounded-xl border border-[#c5c6cd] bg-[#fbf8fa] px-[13px] text-base leading-normal text-[#1b1b1d] outline-none placeholder:text-[#75777d] focus:border-[#0058be] focus:ring-2 focus:ring-[rgba(0,88,190,0.15)]";
