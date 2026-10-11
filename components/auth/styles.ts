// Button styles from the auth designs (Figma New Design). Kept as class strings because they are used on links and
// buttons alike.

const buttonBaseClassName =
  "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-base font-semibold leading-6 drop-shadow-[0_4px_4px_rgba(0,0,0,0.15)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0058be] disabled:cursor-not-allowed disabled:opacity-60";

export const primaryButtonClassName = `${buttonBaseClassName} bg-[#0058be] text-[#f5f3f4] hover:bg-[#004695]`;

// The Siswa variant of the primary button.
export const darkButtonClassName = `${buttonBaseClassName} bg-[#1b1b1d] text-[#f5f3f4] hover:bg-black`;

export const outlineButtonClassName = `${buttonBaseClassName} border-2 border-[#0058be] bg-[#f5f3f4] py-2.5 text-[#0058be] hover:bg-[#e6eff9]`;

export const textLinkClassName = "text-[#0058be] underline hover:text-[#004695]";

// The main button of each role: blue for Guru, black for Siswa (role picker, "Akun Berhasil Dibuat!").
export const roleButtonClassName = { teacher: primaryButtonClassName, student: darkButtonClassName } as const;
